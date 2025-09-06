import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Upload, Camera } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkinDate: Date;
  checkinType: 'monthly' | 'biweekly';
}

const CheckinDialog = ({ open, onOpenChange, checkinDate, checkinType }: CheckinDialogProps) => {
  const [bellyCircumference, setBellyCircumference] = useState("");
  const [hipCircumference, setHipCircumference] = useState("");
  const [leftThigh, setLeftThigh] = useState("");
  const [rightThigh, setRightThigh] = useState("");
  const [nextGoal, setNextGoal] = useState("");
  const [observations, setObservations] = useState("");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, photoType: 'front' | 'side' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      switch (photoType) {
        case 'front':
          setFrontPhoto(file);
          break;
        case 'side':
          setSidePhoto(file);
          break;
        case 'back':
          setBackPhoto(file);
          break;
      }
    }
  };

  const uploadPhoto = async (file: File, filename: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('checkin-photos')
      .upload(`${user?.id}/${filename}`, file);
    
    if (error) {
      console.error('Erro ao fazer upload da foto:', error);
      return null;
    }
    
    return data.path;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      let frontPhotoUrl = null;
      let sidePhotoUrl = null;
      let backPhotoUrl = null;

      // Upload das fotos
      if (frontPhoto) {
        frontPhotoUrl = await uploadPhoto(frontPhoto, `front-${Date.now()}.jpg`);
      }
      if (sidePhoto) {
        sidePhotoUrl = await uploadPhoto(sidePhoto, `side-${Date.now()}.jpg`);
      }
      if (backPhoto) {
        backPhotoUrl = await uploadPhoto(backPhoto, `back-${Date.now()}.jpg`);
      }

      const { error } = await supabase
        .from('client_checkins')
        .insert({
          client_id: user.id,
          checkin_date: checkinDate.toISOString().split('T')[0],
          checkin_type: checkinType,
          belly_circumference: bellyCircumference ? parseFloat(bellyCircumference) : null,
          hip_circumference: hipCircumference ? parseFloat(hipCircumference) : null,
          left_thigh: leftThigh ? parseFloat(leftThigh) : null,
          right_thigh: rightThigh ? parseFloat(rightThigh) : null,
          next_goal: nextGoal || null,
          observations,
          front_photo_url: frontPhotoUrl,
          side_photo_url: sidePhotoUrl,
          back_photo_url: backPhotoUrl,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Check-in realizado!",
        description: "Suas informações foram enviadas para análise do nutricionista.",
      });

      onOpenChange(false);
      
      // Limpar formulário
      setBellyCircumference("");
      setHipCircumference("");
      setLeftThigh("");
      setRightThigh("");
      setNextGoal("");
      setObservations("");
      setFrontPhoto(null);
      setSidePhoto(null);
      setBackPhoto(null);
      
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o check-in. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Check-in {checkinType === 'biweekly' ? 'Quinzenal' : 'Mensal'} - {checkinDate.toLocaleDateString('pt-BR')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload de Fotos */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Fotos para Avaliação</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tire uma foto de lado, uma de frente, e uma de costas para avaliação do nutricionista
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['front', 'side', 'back'].map((type) => (
                <div key={type} className="space-y-2">
                  <Label>
                    {type === 'front' ? 'Frente' : type === 'side' ? 'Lado' : 'Costas'}
                  </Label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {(type === 'front' ? frontPhoto : type === 'side' ? sidePhoto : backPhoto)?.name || 'Selecionar foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, type as 'front' | 'side' | 'back')}
                    />
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Medidas Corporais */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Medidas Corporais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="belly">Circunferência da barriga (cm)</Label>
                <Input
                  id="belly"
                  type="number"
                  placeholder="Meça na direção do umbigo"
                  value={bellyCircumference}
                  onChange={(e) => setBellyCircumference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hip">Circunferência do quadril (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  placeholder="Parte mais larga abaixo do umbigo"
                  value={hipCircumference}
                  onChange={(e) => setHipCircumference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leftThigh">Medida da coxa esquerda (cm)</Label>
                <Input
                  id="leftThigh"
                  type="number"
                  placeholder="Com a coxa relaxada"
                  value={leftThigh}
                  onChange={(e) => setLeftThigh(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rightThigh">Medida da coxa direita (cm)</Label>
                <Input
                  id="rightThigh"
                  type="number"
                  placeholder="Com a coxa relaxada"
                  value={rightThigh}
                  onChange={(e) => setRightThigh(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Objetivo */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Qual o seu objetivo até o próximo check-in?</h3>
            <RadioGroup value={nextGoal} onValueChange={setNextGoal}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mass_gain" id="mass_gain" />
                <Label htmlFor="mass_gain">Ganho de massa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fat_loss" id="fat_loss" />
                <Label htmlFor="fat_loss">Diminuição da gordura</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance">Manutenção do corpo</Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Observações */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Observações</h3>
            <Textarea
              placeholder="Conte todas as suas dificuldades durante a última quinzena, no quesito dieta, e quais foram as refeições que você fez que não estava no cronograma?"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Realizar Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckinDialog;