import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Video, Search, Upload, X } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  description: string;
  instructions: string;
  equipment?: string;
  difficulty?: string;
  video_url?: string;
}

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    muscle_groups: [] as string[],
    description: "",
    instructions: "",
    equipment: "",
    difficulty: "",
    video_url: ""
  });

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas arquivos de vídeo são permitidos (MP4, WebM, OGG, MOV)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 150MB)
    const maxSize = 150 * 1024 * 1024; // 150MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 150MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, video_url: data.publicUrl }));
      
      toast({
        title: "Sucesso",
        description: "Vídeo enviado com sucesso!"
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar o vídeo",
        variant: "destructive"
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (formData.video_url) {
      try {
        // Extract filename from URL
        const url = new URL(formData.video_url);
        const fileName = url.pathname.split('/').pop();
        
        if (fileName && formData.video_url.includes('exercise-videos')) {
          await supabase.storage
            .from('exercise-videos')
            .remove([fileName]);
        }
      } catch (error) {
        console.error('Error removing video:', error);
      }
    }
    
    setFormData(prev => ({ ...prev, video_url: "" }));
    toast({
      title: "Sucesso",
      description: "Vídeo removido com sucesso!"
    });
  };

  const categories = [
    "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdomen", "Cardio", "Funcional"
  ];

  const muscleGroups = [
    "Peitoral", "Dorsal", "Deltoides", "Bíceps", "Tríceps", "Quadríceps", "Posteriores", "Glúteos", "Abdomen", "Panturrilha"
  ];

  const difficulties = ["Iniciante", "Intermediário", "Avançado"];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const exerciseData = {
        name: formData.name,
        category: formData.category,
        muscle_groups: formData.muscle_groups,
        description: formData.description,
        instructions: formData.instructions,
        equipment: formData.equipment || null,
        difficulty: formData.difficulty || null,
        video_url: formData.video_url || null
      };

      if (editingExercise) {
        const { error } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', editingExercise.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Exercício atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert(exerciseData);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Exercício adicionado com sucesso!"
        });
      }

      resetForm();
      fetchExercises();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o exercício",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      muscle_groups: [],
      description: "",
      instructions: "",
      equipment: "",
      difficulty: "",
      video_url: ""
    });
    setEditingExercise(null);
    setShowAddDialog(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      category: exercise.category,
      muscle_groups: exercise.muscle_groups || [],
      description: exercise.description || "",
      instructions: exercise.instructions || "",
      equipment: exercise.equipment || "",
      difficulty: exercise.difficulty || "",
      video_url: exercise.video_url || ""
    });
    setEditingExercise(exercise);
    setShowAddDialog(true);
  };

  const handleMuscleGroupToggle = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups.includes(muscleGroup)
        ? prev.muscle_groups.filter(mg => mg !== muscleGroup)
        : [...prev.muscle_groups, muscleGroup]
    }));
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Exercícios</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Exercício
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar exercícios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Exercise List */}
      <div className="grid gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                  <Badge variant="secondary">{exercise.category}</Badge>
                  {exercise.difficulty && (
                    <Badge variant="outline">{exercise.difficulty}</Badge>
                  )}
                </div>
                
                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_groups.map((group, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                )}

                {exercise.equipment && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Equipamento:</strong> {exercise.equipment}
                  </p>
                )}

                {exercise.description && (
                  <p className="text-sm text-muted-foreground">{exercise.description}</p>
                )}

                {exercise.video_url && (
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <Video className="h-4 w-4" />
                    <span>Vídeo disponível</span>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(exercise)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? "Editar Exercício" : "Adicionar Exercício"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Exercício *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supino reto com halter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Objeto Necessário</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="Ex: Halter, Barra, Máquina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grupos Musculares</Label>
              <div className="grid grid-cols-3 gap-2">
                {muscleGroups.map((group) => (
                  <Button
                    key={group}
                    type="button"
                    variant={formData.muscle_groups.includes(group) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMuscleGroupToggle(group)}
                    className="text-xs"
                  >
                    {group}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Exercício</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do exercício..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções de Execução</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Como executar o exercício corretamente..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_upload">Vídeo Demonstrativo</Label>
              {formData.video_url ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">Vídeo carregado</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <video
                    src={formData.video_url}
                    controls
                    className="w-full h-32 rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Faça upload de um vídeo demonstrativo
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Formatos aceitos: MP4, WebM, OGG, MOV (máx. 150MB)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video_upload"
                    disabled={uploadingVideo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('video_upload')?.click()}
                    disabled={uploadingVideo}
                  >
                    {uploadingVideo ? "Enviando..." : "Selecionar Vídeo"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Salvando..." : editingExercise ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseManagement;