import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPharmacy, PharmacyCreateData } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PharmacyRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PharmacyCreateData>({
    nom: '',
    adresse: '',
    telephone: '',
    opening_time: '08:00',
    closing_time: '20:00',
    assurances_acceptees: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.nom || !formData.adresse) {
      toast({
        title: "Erreur",
        description: "Le nom et l'adresse de la pharmacie sont obligatoires.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createPharmacy(formData);
      toast({
        title: "Succès",
        description: "Votre pharmacie a été soumise pour examen. Elle sera bientôt visible sur la plateforme.",
        variant: "success",
      });
      // Clear form
      setFormData({
        nom: '',
        adresse: '',
        telephone: '',
        opening_time: '08:00',
        closing_time: '20:00',
        assurances_acceptees: '',
      });
    } catch (error) {
      console.error("Failed to create pharmacy:", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message || 'Veuillez réessayer.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl absolute top-8 left-8">
        <Link to="/">
          <Button variant="outline" className="apple-press flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-2xl glass-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Référencer votre Pharmacie</CardTitle>
          <CardDescription className="text-center mt-2">
            Remplissez le formulaire ci-dessous pour ajouter votre pharmacie à notre plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la Pharmacie</Label>
                <Input id="nom" placeholder="Pharmacie Centrale" value={formData.nom} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Numéro de Téléphone</Label>
                <Input id="telephone" placeholder="+241 0x xx xx xx" value={formData.telephone} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse Complète</Label>
              <Input id="adresse" placeholder="Ex: Boulevard Triomphal, Libreville" value={formData.adresse} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening_time">Heure d'Ouverture</Label>
                <Input id="opening_time" type="time" value={formData.opening_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_time">Heure de Fermeture</Label>
                <Input id="closing_time" type="time" value={formData.closing_time} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assurances_acceptees">Assurances Acceptées (séparées par des virgules)</Label>
              <Input id="assurances_acceptees" placeholder="CNAMGS, AXA, NSIA" value={formData.assurances_acceptees} onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full apple-press" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer la Pharmacie'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyRegistration;
