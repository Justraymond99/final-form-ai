import { useState } from "react";
import { Camera, Calendar, Trash2, Eye, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ProgressPhotos = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back' | 'other'>('front');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [compareView, setCompareView] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('photo_date', { ascending: false });
      
      if (error) throw error;
      
      // Get signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from('progress-photos')
            .createSignedUrl(photo.photo_url, 3600);
          
          return { ...photo, signedUrl: urlData?.signedUrl || photo.photo_url };
        })
      );
      
      return photosWithUrls;
    },
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !user) throw new Error('No file selected');
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, selectedFile);
      
      if (uploadError) throw uploadError;
      
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: fileName,
          photo_date: selectedDate,
          photo_type: photoType,
          weight_kg: weight ? parseFloat(weight) : null,
          notes: notes.trim() || null,
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast({ title: "Photo uploaded successfully!" });
      setSelectedFile(null);
      setWeight('');
      setNotes('');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photo: any) => {
      const { error: storageError } = await supabase.storage
        .from('progress-photos')
        .remove([photo.photo_url]);
      
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photo.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast({ title: "Photo deleted" });
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "Please select a photo", variant: "destructive" });
      return;
    }
    setUploading(true);
    await uploadMutation.mutateAsync();
    setUploading(false);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : prev.length < 2 ? [...prev, photoId] : prev
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progress Photos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Progress Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label>Photo Type</Label>
                  <Select value={photoType} onValueChange={(v: any) => setPhotoType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front">Front</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Weight (kg) - Optional</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="75.5"
                  />
                </div>
                <div>
                  <Label>Notes - Optional</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling today?"
                  />
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {photos && photos.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Compare Photos</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareView(!compareView)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {compareView ? 'Grid View' : 'Compare'}
                </Button>
              </CardTitle>
            </CardHeader>
            {compareView && selectedPhotos.length === 2 && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPhotos.map(photoId => {
                    const photo = photos.find(p => p.id === photoId);
                    return photo ? (
                      <div key={photo.id} className="space-y-2">
                        <img
                          src={photo.signedUrl}
                          alt={`Progress ${photo.photo_date}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <p className="text-sm text-center">{photo.photo_date}</p>
                        {photo.weight_kg && (
                          <p className="text-sm text-center text-muted-foreground">
                            {photo.weight_kg}kg
                          </p>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading photos...</div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`cursor-pointer transition-all ${
                  selectedPhotos.includes(photo.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <CardContent className="p-4">
                  <img
                    src={photo.signedUrl}
                    alt={`Progress ${photo.photo_date}`}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {photo.photo_date}
                    </span>
                    <span className="capitalize">{photo.photo_type}</span>
                  </div>
                  {photo.weight_kg && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Weight: {photo.weight_kg}kg
                    </p>
                  )}
                  {photo.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {photo.notes}
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(photo);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No progress photos yet</p>
              <p className="text-muted-foreground">
                Start documenting your transformation journey!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Navigation />
    </div>
  );
};

export default ProgressPhotos;
