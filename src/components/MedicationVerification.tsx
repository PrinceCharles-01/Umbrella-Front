import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pill,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Save
} from "lucide-react";

interface DetectedMedication {
  id?: number;
  nom: string;
  dosage: string;
  dosage_detected?: string;
  frequency?: string;
  categorie?: string;
  confidence?: number;
  matched_text?: string;
  isManuallyAdded?: boolean;
  isEdited?: boolean;
}

interface MedicationVerificationProps {
  medications: DetectedMedication[];
  ocrText: string;
  onConfirm: (verifiedMedications: DetectedMedication[]) => void;
  onCancel: () => void;
}

const MedicationVerification = ({
  medications: initialMedications,
  ocrText,
  onConfirm,
  onCancel
}: MedicationVerificationProps) => {
  const [medications, setMedications] = useState<DetectedMedication[]>(initialMedications);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);

  // Éditer un médicament
  const handleEdit = (index: number, field: keyof DetectedMedication, value: string) => {
    const updated = [...medications];
    updated[index] = {
      ...updated[index],
      [field]: value,
      isEdited: true
    };
    setMedications(updated);
  };

  // Supprimer un médicament
  const handleRemove = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Ajouter un médicament manuellement
  const handleAddManual = () => {
    const newMedication: DetectedMedication = {
      nom: "",
      dosage: "",
      categorie: "",
      confidence: 100,
      isManuallyAdded: true,
      isEdited: true
    };
    setMedications([...medications, newMedication]);
    setEditingIndex(medications.length);
  };

  // Basculer mode édition
  const toggleEdit = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  // Valider et confirmer
  const handleConfirm = () => {
    // Filtrer les médicaments vides
    const validMedications = medications.filter(med =>
      med.nom.trim() !== "" && med.dosage.trim() !== ""
    );

    if (validMedications.length === 0) {
      alert("Veuillez ajouter au moins un médicament.");
      return;
    }

    onConfirm(validMedications);
  };

  // Obtenir la couleur du badge selon confiance
  const getConfidenceBadgeVariant = (confidence?: number) => {
    if (!confidence) return "secondary";
    if (confidence >= 90) return "default";
    if (confidence >= 75) return "secondary";
    return "destructive";
  };

  // Obtenir l'icône selon confiance
  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <AlertTriangle className="h-4 w-4" />;
    if (confidence >= 90) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (confidence >= 75) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Vérification des médicaments détectés
          </CardTitle>
          <CardDescription>
            Vérifiez et modifiez les informations avant de confirmer
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerte si confiance faible */}
      {medications.some(med => (med.confidence || 0) < 80) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Certains médicaments ont un niveau de confiance faible.
            Veuillez vérifier attentivement les informations.
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des médicaments */}
      <div className="space-y-3">
        {medications.map((med, index) => (
          <Card key={index} className={`${
            med.isManuallyAdded ? 'border-blue-500 border-2' :
            med.isEdited ? 'border-yellow-500' : ''
          }`}>
            <CardContent className="pt-6">
              {editingIndex === index ? (
                // Mode édition
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`nom-${index}`}>Nom du médicament *</Label>
                      <Input
                        id={`nom-${index}`}
                        value={med.nom}
                        onChange={(e) => handleEdit(index, 'nom', e.target.value)}
                        placeholder="Ex: Doliprane"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`dosage-${index}`}>Dosage *</Label>
                      <Input
                        id={`dosage-${index}`}
                        value={med.dosage}
                        onChange={(e) => handleEdit(index, 'dosage', e.target.value)}
                        placeholder="Ex: 1000mg"
                      />
                    </div>
                  </div>

                  {med.dosage_detected && (
                    <div className="space-y-2">
                      <Label htmlFor={`dosage-detected-${index}`}>Dosage détecté (OCR)</Label>
                      <Input
                        id={`dosage-detected-${index}`}
                        value={med.dosage_detected || ''}
                        onChange={(e) => handleEdit(index, 'dosage_detected', e.target.value)}
                        placeholder="Ex: 1000mg"
                      />
                    </div>
                  )}

                  {med.frequency && (
                    <div className="space-y-2">
                      <Label htmlFor={`frequency-${index}`}>Fréquence de prise</Label>
                      <Input
                        id={`frequency-${index}`}
                        value={med.frequency || ''}
                        onChange={(e) => handleEdit(index, 'frequency', e.target.value)}
                        placeholder="Ex: matin_soir"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleEdit(index)}
                      variant="default"
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                    <Button
                      onClick={() => handleRemove(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                // Mode affichage
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{med.nom}</p>
                        {med.isManuallyAdded && (
                          <Badge variant="outline">Ajouté manuellement</Badge>
                        )}
                        {med.isEdited && !med.isManuallyAdded && (
                          <Badge variant="outline">Modifié</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Dosage: {med.dosage}</p>
                        {med.dosage_detected && med.dosage_detected !== med.dosage && (
                          <p className="text-yellow-600">
                            Dosage OCR détecté: {med.dosage_detected}
                          </p>
                        )}
                        {med.frequency && (
                          <p>Fréquence: {med.frequency}</p>
                        )}
                        {med.matched_text && (
                          <p className="text-xs">Texte matché: "{med.matched_text}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {med.confidence !== undefined && (
                      <div className="flex items-center gap-2">
                        {getConfidenceIcon(med.confidence)}
                        <Badge variant={getConfidenceBadgeVariant(med.confidence)}>
                          {med.confidence}%
                        </Badge>
                      </div>
                    )}
                    <Button
                      onClick={() => toggleEdit(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRemove(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {medications.length === 0 && (
          <Alert>
            <AlertDescription>
              Aucun médicament détecté. Ajoutez-en manuellement.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Bouton ajouter médicament */}
      <Button
        onClick={handleAddManual}
        variant="outline"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un médicament manuellement
      </Button>

      {/* Texte OCR (collapsible) */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowOcrText(!showOcrText)}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Texte OCR détecté</span>
            <Button variant="ghost" size="sm">
              {showOcrText ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showOcrText && (
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
              {ocrText || "Aucun texte détecté"}
            </pre>
          </CardContent>
        )}
      </Card>

      {/* Actions finales */}
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
          disabled={medications.length === 0}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirmer ({medications.length})
        </Button>
      </div>

      {/* Légende */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Légende des niveaux de confiance:</strong>
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>≥90% - Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>75-89% - À vérifier</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>&lt;75% - Vérifier absolument</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationVerification;
