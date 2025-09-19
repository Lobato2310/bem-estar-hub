import { useEffect, useState } from "react";
import { AlertCircle, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="bg-destructive/90 backdrop-blur-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Você está offline. Algumas funcionalidades podem não funcionar.</span>
          {isOnline && (
            <div className="flex items-center text-green-400">
              <Wifi className="h-4 w-4 mr-1" />
              <span className="text-sm">Reconectado!</span>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};