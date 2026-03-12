import { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Building2, Calculator, Users, Brain, Shield, CreditCard, Upload, Tag, Edit, Trash2, Plus, UserPlus, X } from 'lucide-react';
import { useCompany } from '../hooks/useCompany';
import { useCompanySettings } from '../hooks/useCompanySettings';
import { useServices } from '../hooks/useServices';
import { useSubscription } from '../hooks/useSubscription';
import { useUsageStats } from '../hooks/useUsageStats';
import { useInvitations } from '../hooks/useInvitations';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useAuth } from '../contexts/AuthContext';
import { ServiceFormModal } from '../components/services/ServiceFormModal';
import { InviteMemberModal } from '../components/team/InviteMemberModal';
import { getProductByPriceId } from '../stripe-config';
import type { Service } from '../hooks/useServices';

type SettingsTab = 'company' | 'accounting' | 'services' | 'team' | 'ai' | 'security' | 'billing';

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Building2 }> = [
  { id: 'company', label: 'Entreprise', icon: Building2 },
  { id: 'accounting', label: 'Comptabilité', icon: Calculator },
  { id: 'services', label: 'Tarifs', icon: Tag },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'ai', label: 'Base IA', icon: Brain },
  { id: 'security', label: 'Sécurité & RGPD', icon: Shield },
  { id: 'billing', label: 'Facturation', icon: CreditCard },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const { company, loading, updateCompany, uploadLogo } = useCompany();
  const { settings, updateSettings } = useCompanySettings();
  const { services, loading: servicesLoading, createService, updateService, deleteService } = useServices();
  const { subscription, getActivePlan } = useSubscription();
  const { stats, loading: statsLoading } = useUsageStats();
  const { invitations, loading: invitationsLoading, createInvitation, cancelInvitation } = useInvitations();
  const { members, loading: membersLoading } = useTeamMembers();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    siret: '',
    vat_number: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    primary_color: '#0D47A1',
    secondary_color: '#1976D2',
  });

  const [accountingData, setAccountingData] = useState({
    invoice_number_pattern: 'FAC-{YYYY}-{0001}',
    quote_number_pattern: 'DEV-{YYYY}-{0001}',
    default_tva_rate: 20,
    default_payment_terms: '30 jours',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAccounting, setSavingAccounting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        siret: company.siret || '',
        vat_number: company.vat_number || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        postal_code: company.postal_code || '',
        city: company.city || '',
        primary_color: company.primary_color || '#0D47A1',
        secondary_color: company.secondary_color || '#1976D2',
      });
    }
  }, [company]);

  useEffect(() => {
    if (settings) {
      setAccountingData({
        invoice_number_pattern: settings.invoice_number_pattern || 'FAC-{YYYY}-{0001}',
        quote_number_pattern: settings.quote_number_pattern || 'DEV-{YYYY}-{0001}',
        default_tva_rate: settings.default_tva_rate || 20,
        default_payment_terms: settings.default_payment_terms || '30 jours',
      });
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximale: 2 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    try {
      setUploading(true);
      await uploadLogo(file);
      alert('Logo mis à jour avec succès');
    } catch (err) {
      alert('Erreur lors du téléchargement du logo');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateCompany(formData);
      alert('Informations mises à jour avec succès');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (field: 'primary_color' | 'secondary_color', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingAccounting(true);
      await updateSettings(accountingData);
      alert('Paramètres comptables mis à jour avec succès');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
      console.error(err);
    } finally {
      setSavingAccounting(false);
    }
  };

  const handleServiceSubmit = async (data: any) => {
    if (editingService) {
      await updateService(editingService.id, data);
    } else {
      await createService(data);
    }
    setIsServiceModalOpen(false);
    setEditingService(undefined);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await deleteService(id);
    }
  };

  const handleNewService = () => {
    setEditingService(undefined);
    setIsServiceModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Paramètres</h1>
        <p className="text-builty-gray-light text-lg">Configurez votre entreprise et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-3 h-fit sticky top-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-builty-blue text-white shadow-md'
                      : 'text-builty-gray hover:bg-builty-gray-lighter'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="lg:col-span-3 p-8">
          {activeTab === 'company' && (
            <div>
              <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Informations entreprise</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div className="flex flex-col space-y-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {company?.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Upload...' : 'Changer'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="h-20 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="#0D47A1"
                          value={formData.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur secondaire</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="h-20 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="#1976D2"
                          value={formData.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Input
                  label="Raison sociale"
                  placeholder="Nom de l'entreprise"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="SIRET"
                    placeholder="123 456 789 00012"
                    value={formData.siret}
                    onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))}
                  />
                  <Input
                    label="TVA intracommunautaire"
                    placeholder="FR12345678901"
                    value={formData.vat_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                  />
                </div>

                <Input
                  label="Adresse"
                  placeholder="Adresse complète"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Code postal"
                    placeholder="75001"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  />
                  <Input
                    label="Ville"
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="contact@entreprise.fr"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'accounting' && (
            <div>
              <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Paramètres comptables</h2>
              <form onSubmit={handleAccountingSubmit} className="space-y-4">
                <Input
                  label="Pattern numérotation factures"
                  placeholder="FAC-{YYYY}-{0001}"
                  value={accountingData.invoice_number_pattern}
                  onChange={(e) => setAccountingData(prev => ({ ...prev, invoice_number_pattern: e.target.value }))}
                />
                <p className="text-sm text-gray-500">
                  Placeholders disponibles: {'{YYYY}'} (année), {'{MM}'} (mois), {'{0001}'} (numéro)
                </p>

                <Input
                  label="Pattern numérotation devis"
                  placeholder="DEV-{YYYY}-{0001}"
                  value={accountingData.quote_number_pattern}
                  onChange={(e) => setAccountingData(prev => ({ ...prev, quote_number_pattern: e.target.value }))}
                />

                <Select
                  label="Taux TVA par défaut"
                  value={accountingData.default_tva_rate.toString()}
                  onChange={(e) => setAccountingData(prev => ({ ...prev, default_tva_rate: parseFloat(e.target.value) }))}
                >
                  <option value="0">0%</option>
                  <option value="5.5">5,5%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                </Select>

                <Input
                  label="Conditions de paiement par défaut"
                  placeholder="30 jours"
                  value={accountingData.default_payment_terms}
                  onChange={(e) => setAccountingData(prev => ({ ...prev, default_payment_terms: e.target.value }))}
                />

                <div className="pt-4">
                  <Button type="submit" disabled={savingAccounting}>
                    {savingAccounting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-builty-gray">Tarifs des services</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Ces tarifs constituent la base de connaissances pour l'IA lors de la génération automatique des devis
                  </p>
                </div>
                <Button onClick={handleNewService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un service
                </Button>
              </div>

              {servicesLoading ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
              ) : services.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun service</h3>
                  <p className="text-gray-600 mb-4">
                    Ajoutez vos services et tarifs pour que l'IA puisse les utiliser automatiquement lors de la génération de devis
                  </p>
                  <Button onClick={handleNewService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre premier service
                  </Button>
                </Card>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-builty-gray-lighter border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                          Prix HT
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-500">{service.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {service.unit_price_ht.toFixed(2)} €
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                service.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {service.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <button
                              onClick={() => handleEditService(service)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <ServiceFormModal
                isOpen={isServiceModalOpen}
                onClose={() => {
                  setIsServiceModalOpen(false);
                  setEditingService(undefined);
                }}
                onSubmit={handleServiceSubmit}
                service={editingService}
              />
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Gestion de l'équipe</h2>

              {profile?.role === 'Admin' && (
                <div className="mb-6">
                  <Button onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer un compte membre
                  </Button>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Membres actifs</h3>
                  {membersLoading ? (
                    <div className="text-center py-8 text-gray-500">Chargement...</div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-builty-gray-lighter border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Nom
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Rôle
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Statut
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {members.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {member.full_name || 'Sans nom'}
                                {member.id === profile?.id && (
                                  <span className="ml-2 text-xs text-gray-500">(Vous)</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{member.email}</td>
                              <td className="px-6 py-4">
                                <Badge variant="default">{member.role}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={member.status === 'Active' ? 'success' : 'default'}>
                                  {member.status === 'Active' ? 'Actif' : member.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {invitations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Invitations en attente</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-builty-gray-lighter border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Rôle
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Invité par
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                              Statut
                            </th>
                            {profile?.role === 'Admin' && (
                              <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invitations.map((invitation) => (
                            <tr key={invitation.id}>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {invitation.email}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="default">{invitation.role}</Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {invitation.invited_by_profile?.full_name || invitation.invited_by_profile?.email}
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant={
                                    invitation.status === 'Pending' ? 'warning' :
                                    invitation.status === 'Accepted' ? 'success' :
                                    invitation.status === 'Expired' ? 'default' :
                                    'default'
                                  }
                                >
                                  {invitation.status === 'Pending' && 'En attente'}
                                  {invitation.status === 'Accepted' && 'Acceptée'}
                                  {invitation.status === 'Expired' && 'Expirée'}
                                  {invitation.status === 'Cancelled' && 'Annulée'}
                                </Badge>
                              </td>
                              {profile?.role === 'Admin' && (
                                <td className="px-6 py-4 text-right">
                                  {invitation.status === 'Pending' && (
                                    <button
                                      onClick={() => {
                                        if (confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
                                          cancelInvitation(invitation.id)
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => {
                  setIsInviteModalOpen(false)
                  window.location.reload()
                }}
              />
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Configuration IA</h2>
              <div className="space-y-6">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-800">
                    L'IA s'améliore automatiquement en analysant vos devis historiques pour apprendre vos ratios et optimiser vos futures propositions.
                  </p>
                </Card>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données d'apprentissage</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-builty-gray-lighter rounded-lg p-4">
                      <p className="text-sm text-gray-600">Devis analysés</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                    <div className="bg-builty-gray-lighter rounded-lg p-4">
                      <p className="text-sm text-gray-600">Projets terminés</p>
                      <p className="text-2xl font-bold text-gray-900">48</p>
                    </div>
                    <div className="bg-builty-gray-lighter rounded-lg p-4">
                      <p className="text-sm text-gray-600">Précision</p>
                      <p className="text-2xl font-bold text-gray-900">92%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Button variant="outline">Tester une requête IA</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Sécurité & RGPD</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Export des données</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Téléchargez toutes vos données personnelles au format JSON
                  </p>
                  <Button variant="outline">Demander un export</Button>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Confidentialité</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Recevoir les mises à jour produit</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Partager les données d'usage anonymes</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (() => {
            const activePlan = getActivePlan();
            const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;
            const limits = product?.limits || { employees: 0, activeProjects: 0 };

            const employeesPercentage = limits.employees > 0
              ? Math.round((stats.employees / limits.employees) * 100)
              : 0;
            const projectsPercentage = limits.activeProjects > 0
              ? Math.round((stats.activeProjects / limits.activeProjects) * 100)
              : 0;

            return (
              <div>
                <h2 className="text-2xl font-extrabold text-builty-gray mb-8">Facturation plateforme</h2>
                {product ? (
                  <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">Facturé {product.price.toFixed(2)}€ / mois</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-builty-blue">{product.price.toFixed(0)} €</p>
                        <p className="text-sm text-gray-600">par mois</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {product.name === 'Builty PRO' && (
                        <>
                          <Button variant="outline">Downgrade vers REGULAR</Button>
                          <Button variant="outline">Upgrade vers SUR MESURE</Button>
                        </>
                      )}
                      {product.name === 'Builty REGULAR' && (
                        <>
                          <Button variant="outline">Upgrade vers PRO</Button>
                          <Button variant="outline">Upgrade vers SUR MESURE</Button>
                        </>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 mb-6 bg-builty-gray-lighter border-gray-200">
                    <p className="text-gray-600">Aucun abonnement actif</p>
                  </Card>
                )}

                <h3 className="font-semibold text-gray-900 mb-4">Limites d'usage</h3>
                {statsLoading ? (
                  <div className="text-gray-500">Chargement...</div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Employés</span>
                        <span className="text-gray-900">{stats.employees} / {limits.employees}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-builty-blue h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(employeesPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Projets actifs</span>
                        <span className="text-gray-900">{stats.activeProjects} / {limits.activeProjects}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-builty-blue h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(projectsPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}
