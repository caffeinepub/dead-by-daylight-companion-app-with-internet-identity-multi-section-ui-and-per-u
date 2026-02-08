import { useState } from 'react';
import { useGetPerks, useGetCharacters, useGetCallerData, useSaveUserData } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/Auth/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Save, X, Swords, Loader2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { toast } from 'sonner';
import type { Build, Variant_survivor_killer } from '../backend';

export default function BuildPlannerPage() {
  const { data: perks = [] } = useGetPerks();
  const { data: characters = [] } = useGetCharacters();
  const { data: userData } = useGetCallerData();
  const saveUserData = useSaveUserData();
  const { identity } = useInternetIdentity();

  const [isEditing, setIsEditing] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'survivor' as Variant_survivor_killer,
    character: '',
    perks: [] as string[],
    description: '',
    tips: '',
  });

  const startNewBuild = () => {
    setFormData({
      name: '',
      role: 'survivor' as Variant_survivor_killer,
      character: '',
      perks: [],
      description: '',
      tips: '',
    });
    setEditingBuild(null);
    setIsEditing(true);
  };

  const startEditBuild = (build: Build) => {
    setFormData({
      name: build.name,
      role: build.role,
      character: build.character,
      perks: build.perks,
      description: build.description,
      tips: build.tips,
    });
    setEditingBuild(build);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingBuild(null);
    setFormData({
      name: '',
      role: 'survivor' as Variant_survivor_killer,
      character: '',
      perks: [],
      description: '',
      tips: '',
    });
  };

  const saveBuild = async () => {
    if (!identity || !userData) return;

    if (!formData.name.trim()) {
      toast.error('Please enter a build name');
      return;
    }

    const newBuild: Build = {
      id: editingBuild?.id || `build-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      character: formData.character,
      perks: formData.perks,
      description: formData.description,
      tips: formData.tips,
      creator: identity.getPrincipal().toString(),
    };

    const builds = editingBuild
      ? userData.builds.map((b) => (b.id === editingBuild.id ? newBuild : b))
      : [...userData.builds, newBuild];

    await saveUserData.mutateAsync({
      ...userData,
      builds,
    });

    toast.success(editingBuild ? 'Build updated' : 'Build created');
    cancelEdit();
  };

  const deleteBuild = async (buildId: string) => {
    if (!userData) return;

    const builds = userData.builds.filter((b) => b.id !== buildId);
    await saveUserData.mutateAsync({
      ...userData,
      builds,
    });

    toast.success('Build deleted');
  };

  const togglePerk = (perkId: string) => {
    if (formData.perks.includes(perkId)) {
      setFormData({ ...formData, perks: formData.perks.filter((p) => p !== perkId) });
    } else if (formData.perks.length < 4) {
      setFormData({ ...formData, perks: [...formData.perks, perkId] });
    } else {
      toast.error('Maximum 4 perks allowed');
    }
  };

  const filteredCharacters = characters.filter((c) => c.role === formData.role);
  const filteredPerks = perks.filter((p) => {
    const char = characters.find((c) => c.id === p.characterId);
    return char?.role === formData.role;
  });

  return (
    <AuthGate message="Login to create and manage your builds">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Build Planner</h1>
            <p className="text-muted-foreground">Create and manage your custom builds</p>
          </div>
          {!isEditing && (
            <Button onClick={startNewBuild}>
              <Plus className="h-4 w-4 mr-2" />
              New Build
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingBuild ? 'Edit Build' : 'Create New Build'}</CardTitle>
              <CardDescription>Configure your build with perks and character</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Build Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter build name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as Variant_survivor_killer, character: '', perks: [] })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survivor">Survivor</SelectItem>
                      <SelectItem value="killer">Killer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="character">Character</Label>
                <Select value={formData.character} onValueChange={(v) => setFormData({ ...formData, character: v })}>
                  <SelectTrigger id="character">
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCharacters.map((char) => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Perks ({formData.perks.length}/4)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                  {filteredPerks.map((perk) => (
                    <Button
                      key={perk.id}
                      variant={formData.perks.includes(perk.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePerk(perk.id)}
                      className="justify-start text-xs h-auto py-2"
                    >
                      {perk.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your build strategy"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">Tips</Label>
                <Textarea
                  id="tips"
                  value={formData.tips}
                  onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  placeholder="Add tips for using this build"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveBuild} disabled={saveUserData.isPending}>
                  {saveUserData.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Build
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            {!userData?.builds.length ? (
              <Card>
                <CardContent className="py-16">
                  <EmptyState
                    icon={Swords}
                    title="No builds yet"
                    description="Create your first build to get started"
                    action={
                      <Button onClick={startNewBuild}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Build
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userData.builds.map((build) => (
                  <Card key={build.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{build.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant={build.role === 'killer' ? 'destructive' : 'secondary'} className="text-xs">
                              {build.role === 'killer' ? 'Killer' : 'Survivor'}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {build.character && (
                        <div>
                          <p className="text-sm font-medium mb-1">Character</p>
                          <Badge variant="outline">
                            {characters.find((c) => c.id === build.character)?.name || build.character}
                          </Badge>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium mb-2">Perks</p>
                        <div className="flex flex-wrap gap-1">
                          {build.perks.map((perkId) => (
                            <Badge key={perkId} variant="secondary" className="text-xs">
                              {perks.find((p) => p.id === perkId)?.name || perkId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {build.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{build.description}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => startEditBuild(build)} className="flex-1">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBuild(build.id)}
                          disabled={saveUserData.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGate>
  );
}
