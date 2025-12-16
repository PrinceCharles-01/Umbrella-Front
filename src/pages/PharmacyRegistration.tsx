import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPharmacy, PharmacyCreateData } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, Building2, CheckCircle2, Clock, Phone, MapPin, Shield } from "lucide-react";

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
    } catch (error: any) {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* ============================================
          🎨 HEADER MODERNE & RESPONSIVE
          ============================================ */}
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">PharmFinder</span>
          </Link>

          {/* Bouton retour */}
          <Link to="/">
            <Button variant="outline" size="sm" className="scale-hover">
              <ArrowLeft className="h-3 h-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ============================================
          ✨ MAIN CONTENT - FORMULAIRE
          ============================================ */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header avec badge */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-50 border border-pink-200 rounded-full mb-6">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
              <span className="text-xs sm:text-sm font-medium text-pink-700">Nouveau partenaire</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
              Référencer votre Pharmacie
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejoignez notre réseau et rendez vos médicaments plus accessibles aux patients du Gabon
            </p>
          </div>

          {/* Formulaire dans une card moderne */}
          <Card className="card-modern bg-white border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Nom et Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="nom" className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      Nom de la Pharmacie *
                    </Label>
                    <Input
                      id="nom"
                      placeholder="Pharmacie Centrale"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="telephone" className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-pink-600" />
                      Numéro de Téléphone
                    </Label>
                    <Input
                      id="telephone"
                      placeholder="+241 0x xx xx xx"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="adresse" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Adresse Complète *
                  </Label>
                  <Input
                    id="adresse"
                    placeholder="Ex: Boulevard Triomphal, Libreville"
                    value={formData.adresse}
                    onChange={handleChange}
                    required
                    className="h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                {/* Horaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="opening_time" className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Heure d'Ouverture
                    </Label>
                    <Input
                      id="opening_time"
                      type="time"
                      value={formData.opening_time}
                      onChange={handleChange}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="closing_time" className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-600" />
                      Heure de Fermeture
                    </Label>
                    <Input
                      id="closing_time"
                      type="time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Assurances */}
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="assurances_acceptees" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Assurances Acceptées
                  </Label>
                  <Input
                    id="assurances_acceptees"
                    placeholder="CNAMGS, AXA, NSIA (séparées par des virgules)"
                    value={formData.assurances_acceptees}
                    onChange={handleChange}
                    className="h-11 sm:h-12 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Séparez chaque assurance par une virgule</p>
                </div>

                {/* Bouton Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg btn-primary scale-hover"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Enregistrer la Pharmacie
                    </>
                  )}
                </Button>
              </form>

              {/* Info card */}
              <div className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-pink-50 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Pourquoi nous rejoindre ?
                </h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>Augmentez votre visibilité auprès de milliers de patients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>Gestion simplifiée de votre stock en temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>Référencement gratuit et rapide</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ============================================
          📄 FOOTER MODERNE & RESPONSIVE
          ============================================ */}
      <footer className="border-t border-border/50 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-4">
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions Légales</Link>
            <Link to="/register-pharmacy" className="hover:text-foreground transition-colors font-medium">Référencer ma pharmacie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PharmacyRegistration;
