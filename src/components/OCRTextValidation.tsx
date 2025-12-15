import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  CheckCircle2,
  X,
  Edit2,
  AlertTriangle
} from "lucide-react";

interface OCRTextValidationProps {
  ocrText: string;
  onConfirm: (validatedText: string) => void;
  onCancel: () => void;
}

const OCRTextValidation = ({ ocrText, onConfirm, onCancel }: OCRTextValidationProps) => {
  const [editedText, setEditedText] = useState(ocrText);
  const [isEdited, setIsEdited] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    setIsEdited(e.target.value !== ocrText);
  };

  const handleConfirm = () => {
    if (editedText.trim() === "") {
      alert("Le texte ne peut pas être vide");
      return;
    }
    onConfirm(editedText);
  };

  const handleReset = () => {
    setEditedText(ocrText);
    setIsEdited(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vérification du texte OCR
          </CardTitle>
          <CardDescription>
            Vérifiez et corrigez le texte détecté avant d'extraire les médicaments
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerte info */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Le texte ci-dessous a été extrait de votre ordonnance.
          Vous pouvez le modifier si nécessaire avant de continuer.
        </AlertDescription>
      </Alert>

      {/* Zone de texte éditable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Texte détecté
            </CardTitle>
            {isEdited && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedText}
            onChange={handleTextChange}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Le texte OCR apparaîtra ici..."
          />
          {isEdited && (
            <p className="text-sm text-yellow-600 mt-2">
              ✏️ Texte modifié - Les modifications seront prises en compte lors de l'extraction des médicaments
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {editedText.length} caractères
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="default"
          className="flex-1"
          disabled={editedText.trim() === ""}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Extraire les médicaments
        </Button>
      </div>

      {/* Conseils */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>💡 Conseils:</strong>
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Vérifiez que les noms de médicaments sont correctement orthographiés</li>
            <li>• Assurez-vous que les dosages sont lisibles (ex: 1000mg, 500mg)</li>
            <li>• Corrigez les erreurs de reconnaissance si nécessaire</li>
            <li>• Le système utilisera ce texte pour extraire les médicaments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRTextValidation;
