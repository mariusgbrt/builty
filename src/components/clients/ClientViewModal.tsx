import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Building2, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Client } from '../../hooks/useClients';

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onEdit: () => void;
  stats: {
    projectsCount: number;
    quotesCount: number;
    invoicesCount: number;
  };
}

export function ClientViewModal({ isOpen, onClose, client, onEdit, stats }: ClientViewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du client">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              client.type === 'Entreprise' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {client.type === 'Entreprise' ? (
                <Building2 className="h-6 w-6 text-blue-600" />
              ) : (
                <User className="h-6 w-6 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-builty-gray">{client.name}</h3>
              <Badge variant={client.type === 'Entreprise' ? 'info' : 'default'} className="mt-1">
                {client.type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-builty-gray-lighter rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-builty-blue">{stats.projectsCount}</p>
            <p className="text-sm text-gray-600">Projets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-builty-blue">{stats.quotesCount}</p>
            <p className="text-sm text-gray-600">Devis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-builty-blue">{stats.invoicesCount}</p>
            <p className="text-sm text-gray-600">Factures</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Coordonnées</h4>

          {client.email && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a href={`mailto:${client.email}`} className="text-builty-blue hover:underline">
                  {client.email}
                </a>
              </div>
            </div>
          )}

          {client.phone && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <a href={`tel:${client.phone}`} className="text-gray-900">
                  {client.phone}
                </a>
              </div>
            </div>
          )}

          {(client.address || client.city) && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="text-gray-900">
                  {client.address && <span>{client.address}<br /></span>}
                  {client.postal_code && <span>{client.postal_code} </span>}
                  {client.city}
                </p>
              </div>
            </div>
          )}

          {client.siret && (
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">SIRET</p>
                <p className="text-gray-900">{client.siret}</p>
              </div>
            </div>
          )}
        </div>

        {client.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit}>
            Modifier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
