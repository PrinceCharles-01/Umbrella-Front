import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Medication {
  id: number | null;
  nom: string;
  description: string;
  dosage: string;
  categorie: string;
  prix: number;
  min_stock: number; // Added min_stock field
  created_at?: string;
  updated_at?: string;
}

interface Pharmacy {
  id: number | null;
  nom: string;
  adresse: string;
  telephone: string;
  opening_time: string;
  closing_time: string;
  latitude: string;
  longitude: string;
  note: string;
  assurances_acceptees: string[];
  assurance_speciale: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Pharmacy | Medication | null;
  itemType: "pharmacy" | "medication";
  onSave: (item: Pharmacy | Medication) => void;
  allMedicationCategories: string[]; // For medication categories dropdown
}

const AdminEditModal: React.FC<AdminEditModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType,
  onSave,
  allMedicationCategories,
}) => {
  const [formData, setFormData] = useState<any>(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!formData) return null; // Should not happen if item is properly passed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{formData.id ? `Modifier ${itemType === "pharmacy" ? "la Pharmacie" : "le Médicament"}` : `Ajouter ${itemType === "pharmacy" ? "une Pharmacie" : "un Médicament"}`}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {itemType === "pharmacy" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={formData.nom} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" value={formData.telephone} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea id="adresse" value={formData.adresse} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening_time">Heure d'ouverture</Label>
                <Input id="opening_time" type="time" value={formData.opening_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_time">Heure de fermeture</Label>
                <Input id="closing_time" type="time" value={formData.closing_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" value={formData.latitude} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" value={formData.longitude} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Input id="note" type="number" step="0.1" value={formData.note} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assurance_speciale">Assurance spéciale</Label>
                <Input id="assurance_speciale" value={formData.assurance_speciale || ''} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="assurances_acceptees">Assurances acceptées (séparées par des virgules)</Label>
                <Input 
                  id="assurances_acceptees" 
                  value={Array.isArray(formData.assurances_acceptees) ? formData.assurances_acceptees.join(', ') : ''} 
                  onChange={(e) => {
                    const value = e.target.value.split(',').map(s => s.trim());
                    setFormData(prev => ({...prev, assurances_acceptees: value}));
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">Nom</Label>
                <Input id="nom" value={formData.nom} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">Dosage</Label>
                <Input id="dosage" value={formData.dosage} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categorie" className="text-right">Catégorie</Label>
                <Select onValueChange={(value) => handleSelectChange("categorie", value)} value={formData.categorie}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMedicationCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prix" className="text-right">Prix (FCFA)</Label>
                <Input id="prix" type="number" value={formData.prix / 100} onChange={(e) => handleChange({ ...e, target: { ...e.target, value: String(parseFloat(e.target.value) * 100) }})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min_stock" className="text-right">Stock minimum</Label>
                <Input id="min_stock" type="number" value={formData.min_stock} onChange={handleChange} className="col-span-3" />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditModal;