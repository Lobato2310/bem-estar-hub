import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import ClientEvolutionGraphs from "./ClientEvolutionGraphs";

interface ClientEvolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const ClientEvolutionDialog = ({ open, onOpenChange, clientId, clientName }: ClientEvolutionDialogProps) => {
  const handleExportPDF = () => {
    // TODO: Implementar exportação em PDF
    console.log('Exportando relatório em PDF para:', clientName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Relatório de Evolução - {clientName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <ClientEvolutionGraphs 
            clientId={clientId} 
            clientName={clientName} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEvolutionDialog;