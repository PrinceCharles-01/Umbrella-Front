import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pill,
  FileText
} from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api.config";
import { useToast } from "@/hooks/use-toast";
import OCRTextValidation from "./OCRTextValidation";
import { httpRequest } from "@/lib/http";

interface DetectedMedication {
  id: number;
  nom: string;
  dosage: string;
  categorie: string;
  confidence: number;
  matched_text: string;
}

interface ScanResult {
  success: boolean;
  text_detected: string;
  medications: DetectedMedication[];
  medication_ids: number[];
  message: string;
  error?: string;
}

interface PrescriptionScanProps {
  onMedicationsDetected?: (medicationIds: number[], medications: DetectedMedication[], ocrText: string) => void;
}

const PrescriptionScan = ({ onMedicationsDetected }: PrescriptionScanProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [ocrTextForValidation, setOcrTextForValidation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image est trop grande. Maximum: 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset le résultat précédent
    setScanResult(null);
  };

  // Scanner l'ordonnance
  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Envoyer à l'API
      const response = await httpRequest(buildApiUrl(API_ENDPOINTS.SCAN_PRESCRIPTION), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du scan');
      }

      const result: ScanResult = await response.json();

      // Afficher d'abord le texte OCR pour validation
      if (result.success && result.text_detected) {
        setOcrTextForValidation(result.text_detected);
        toast({
          title: "Texte extrait !",
          description: "Vérifiez le texte détecté avant d'extraire les médicaments.",
        });
      } else {
        setScanResult(result);
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors du scan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur scan:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Gérer la validation du texte OCR et extraire les médicaments
  const handleOCRConfirm = async (validatedText: string) => {
    setIsScanning(true);
    try {
      // Appeler un nouvel endpoint pour extraire les médicaments depuis le texte
      const response = await httpRequest(buildApiUrl('/extract-medications-from-text/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: validatedText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'extraction');
      }

      const result: ScanResult = await response.json();
      setScanResult(result);
      setOcrTextForValidation(null);

      if (result.success) {
        if (result.medications.length > 0) {
          toast({
            title: "Médicaments extraits !",
            description: result.message,
          });
        } else {
          // Même sans match, on affiche un message informatif
          toast({
            title: "Texte extrait",
            description: "Aucun médicament correspondant trouvé dans la base. Vous pourrez les ajouter manuellement.",
            variant: "default",
          });
        }

        // TOUJOURS appeler le callback, même si medications est vide
        // Cela permet d'afficher le texte extrait et de laisser l'utilisateur ajouter manuellement
        if (onMedicationsDetected) {
          onMedicationsDetected(result.medication_ids, result.medications, validatedText);
        }
      }
    } catch (error) {
      console.error("Erreur extraction:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Annuler la validation OCR
  const handleOCRCancel = () => {
    setOcrTextForValidation(null);
  };

  // Reset
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setOcrTextForValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation du texte OCR */}
      {ocrTextForValidation ? (
        <OCRTextValidation
          ocrText={ocrTextForValidation}
          onConfirm={handleOCRConfirm}
          onCancel={handleOCRCancel}
        />
      ) : (
        <>
          {/* Section Upload */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner une ordonnance
          </CardTitle>
          <CardDescription>
            Prenez une photo de votre ordonnance ou uploadez une image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview de l'image */}
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Ordonnance"
                className="w-full max-h-96 object-contain rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Cliquez pour sélectionner une image ou glissez-la ici
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choisir une image
              </Button>
            </div>
          )}

          {/* Bouton Scanner */}
          {selectedFile && !scanResult && (
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Scanner l'ordonnance
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Résultats du scan */}
      {scanResult && (
        <div className="space-y-4">
          {/* Médicaments détectés */}
          {scanResult.success && scanResult.medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Médicaments détectés
                </CardTitle>
                <CardDescription>
                  {scanResult.medications.length} médicament(s) reconnu(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scanResult.medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{med.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.categorie}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Détecté: "{med.matched_text}"
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {med.confidence}% confiance
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Texte détecté */}
          {scanResult.text_detected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Texte détecté (OCR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                  {scanResult.text_detected}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Erreur */}
          {scanResult.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scanResult.error}</AlertDescription>
            </Alert>
          )}

          {/* Bouton nouvelle scan */}
          <Button onClick={handleReset} variant="outline" className="w-full">
            Scanner une autre ordonnance
          </Button>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PrescriptionScan;
