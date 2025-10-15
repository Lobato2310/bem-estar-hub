import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Dumbbell } from "lucide-react";

interface Exercise {
  id?: string;
  name: string;
  description?: string;
  muscle_groups?: string[];
  category?: string;
  video_url?: string;
  instructions?: string;
}

interface ExerciseDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

const ExerciseDetailsDialog = ({ isOpen, onClose, exercise }: ExerciseDetailsDialogProps) => {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span>{exercise.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Video Section */}
            {exercise.video_url && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Play className="h-4 w-4 text-primary" />
                  <span>Vídeo Demonstrativo</span>
                </h3>
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    src={exercise.video_url}
                    controls
                    playsInline
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    className="w-full max-h-96"
                    preload="metadata"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {exercise.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Instruções</h3>
                <div className="bg-accent/50 p-4 rounded-lg">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {exercise.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Category and Muscle Groups */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Categoria</h3>
                <Badge variant="secondary">{exercise.category}</Badge>
              </div>
              
              {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Grupos Musculares</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscle_groups.map((muscle, index) => (
                      <Badge key={index} variant="outline">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailsDialog;