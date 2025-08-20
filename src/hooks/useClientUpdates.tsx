import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ClientUpdate {
  id: string;
  client_id: string;
  professional_id: string;
  update_type: string;
  update_message: string;
  is_viewed: boolean;
  created_at: string;
  updated_at: string;
}

export const useClientUpdates = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carregar atualizações do cliente
  const loadUpdates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('client_updates')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUpdates(data || []);
      const notViewed = data?.filter(update => !update.is_viewed).length || 0;
      setUnviewedCount(notViewed);

      // Mostrar toast para atualizações não visualizadas
      if (notViewed > 0) {
        toast.info(`Você tem ${notViewed} nova${notViewed > 1 ? 's' : ''} atualização${notViewed > 1 ? 'ões' : ''} do seu profissional`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar atualizações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar atualizações como visualizadas
  const markAsViewed = async (updateIds: string[]) => {
    if (!user || updateIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('client_updates')
        .update({ is_viewed: true })
        .in('id', updateIds);

      if (error) throw error;

      // Atualizar estado local
      setUpdates(prev => 
        prev.map(update => 
          updateIds.includes(update.id) 
            ? { ...update, is_viewed: true }
            : update
        )
      );
      
      setUnviewedCount(prev => Math.max(0, prev - updateIds.length));
    } catch (error) {
      console.error('Erro ao marcar como visualizado:', error);
    }
  };

  // Marcar todas como visualizadas
  const markAllAsViewed = async () => {
    const unviewedIds = updates
      .filter(update => !update.is_viewed)
      .map(update => update.id);
    
    if (unviewedIds.length > 0) {
      await markAsViewed(unviewedIds);
    }
  };

  useEffect(() => {
    loadUpdates();

    // Configurar realtime para escutar novas atualizações
    if (user) {
      const channel = supabase
        .channel('client_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'client_updates',
            filter: `client_id=eq.${user.id}`,
          },
          (payload) => {
            const newUpdate = payload.new as ClientUpdate;
            setUpdates(prev => [newUpdate, ...prev]);
            setUnviewedCount(prev => prev + 1);
            
            // Mostrar toast para nova atualização
            toast.info(newUpdate.update_message, {
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    updates,
    unviewedCount,
    loading,
    markAsViewed,
    markAllAsViewed,
    refreshUpdates: loadUpdates
  };
};