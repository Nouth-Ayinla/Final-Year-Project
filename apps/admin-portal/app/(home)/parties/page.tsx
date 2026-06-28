"use client";

import { useState, useEffect } from "react";
import { Flag, PlusCircle, Pencil, Trash2, CheckCircle2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminGuard from "@/components/guard/AdminGuard";
import { useElectionStore } from "@/app/store/useElectionStore";
import { toast } from "sonner";

type Party = {
  id: string;
  abbreviation: string;
  name: string;
  flag?: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string;
  isActive: boolean;
};

export default function PartiesPage() {
  const {
    parties,
    getParties,
    createParty,
    editParty,
    deleteParty,
    isCreatingParty,
    isGettingParties
  } = useElectionStore();

  const [activeTab, setActiveTab] = useState("list");
  
  // Registration Form State
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");
  const [description, setDescription] = useState("");

  // Edit Modal State
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrimaryColor, setEditPrimaryColor] = useState("#3b82f6");
  const [editSecondaryColor, setEditSecondaryColor] = useState("#1e293b");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Load parties on mount
  useEffect(() => {
    getParties();
  }, [getParties]);

  const handleRegisterParty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !abbreviation) {
      toast.error("Please fill in the Party Name and Abbreviation.");
      return;
    }

    const success = await createParty({
      name: name.trim(),
      abbreviation: abbreviation.trim().toUpperCase(),
      primaryColor,
      secondaryColor,
      description: description.trim(),
    });

    if (success) {
      // Reset Form
      setName("");
      setAbbreviation("");
      setPrimaryColor("#3b82f6");
      setSecondaryColor("#1e293b");
      setDescription("");
      setActiveTab("list");
      getParties(); // Reload list
    }
  };

  const handleOpenEdit = (party: Party) => {
    setEditingParty(party);
    setEditName(party.name);
    setEditPrimaryColor(party.primaryColor);
    setEditSecondaryColor(party.secondaryColor);
    setEditDescription(party.description || "");
    setEditIsActive(party.isActive);
  };

  const handleUpdateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParty) return;

    if (!editName) {
      toast.error("Party Name is required.");
      return;
    }

    const success = await editParty(editingParty.id, {
      name: editName.trim(),
      primaryColor: editPrimaryColor,
      secondaryColor: editSecondaryColor,
      description: editDescription.trim(),
      isActive: editIsActive,
    });

    if (success) {
      setEditingParty(null);
      getParties();
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (confirm("Are you sure you want to delete or deactivate this political party?")) {
      const success = await deleteParty(partyId);
      if (success) {
        getParties();
      }
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Flag className="size-8" />
            Political Parties
          </h1>
          <p className="text-muted-foreground text-sm">
            Register, edit, and configure political party parameters stored in PostgreSQL.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl h-11 max-w-md">
            <TabsTrigger value="list" className="rounded-lg text-sm font-medium">
              Registered Parties
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-sm font-medium">
              Register New Party
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
            <Card className="border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Political Party Registry</CardTitle>
                <CardDescription>
                  Active political organizations registered in the PostgreSQL database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGettingParties && parties.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    Loading political parties...
                  </div>
                ) : parties.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No political parties registered yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parties.map((party: Party) => (
                      <div
                        key={party.id}
                        className="border border-border/80 rounded-xl p-5 bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between h-[210px] hover:border-primary/30 transition-all group"
                      >
                        {/* Upper Section */}
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              {/* Color Flag Swatch */}
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border shadow-inner text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${party.primaryColor}, ${party.secondaryColor})`,
                                }}
                              >
                                {party.abbreviation.slice(0, 3)}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-base text-foreground leading-tight">
                                  {party.abbreviation}
                                </h3>
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                                  Party Code
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                party.isActive 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${party.isActive ? "bg-emerald-500" : "bg-stone-400"}`}></span>
                                {party.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </div>

                          {/* Middle Description */}
                          <p className="text-xs font-bold text-foreground line-clamp-1">
                            {party.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {party.description || "No description provided for this political organization."}
                          </p>
                        </div>

                        {/* Bottom Actions and Swatches */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-[10px]">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                              onClick={() => handleOpenEdit(party)}
                              title="Edit Party"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                              onClick={() => handleDeleteParty(party.id)}
                              title="Delete Party"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="font-medium text-[9px]">Swatches</span>
                            <div className="flex gap-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border shadow-sm shrink-0"
                                style={{ backgroundColor: party.primaryColor }}
                              ></span>
                              <span
                                className="w-3.5 h-3.5 rounded-full border shadow-sm shrink-0"
                                style={{ backgroundColor: party.secondaryColor }}
                              ></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <Card className="border border-border/80 shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle>Register Political Party</CardTitle>
                <CardDescription>
                  Register a new party configuration in the database. Make sure the abbreviation is unique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterParty} className="space-y-6">
                  {/* Abbreviation and Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Party Abbreviation *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. APC, PDP, LP"
                        value={abbreviation}
                        onChange={(e) => setAbbreviation(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Party Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. All Progressives Congress"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Colors Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-10 p-0.5 border cursor-pointer rounded"
                        />
                        <Input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-10 p-0.5 border cursor-pointer rounded"
                        />
                        <Input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Party Description
                    </label>
                    <textarea
                      placeholder="Brief description of the political organization..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full text-xs rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreatingParty}>
                    {isCreatingParty ? (
                      "Registering..."
                    ) : (
                      <>
                        <PlusCircle className="size-4 mr-2" />
                        Register Party
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Edit Modal Dialog */}
      {editingParty && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg p-6 rounded-xl shadow-lg relative flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Pencil className="size-5 text-primary" />
                  Edit Party Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update name, colors, and status for {editingParty.abbreviation}.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setEditingParty(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateParty} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Party Name *
                </label>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="w-10 h-9 p-0.5 border cursor-pointer rounded"
                    />
                    <Input
                      type="text"
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="w-10 h-9 p-0.5 border cursor-pointer rounded"
                    />
                    <Input
                      type="text"
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Toggle Active status */}
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-lg border border-border/80">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-stone-300 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-foreground uppercase tracking-wide cursor-pointer select-none">
                  Political Party Active and Eligible
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingParty(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="text-xs"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
