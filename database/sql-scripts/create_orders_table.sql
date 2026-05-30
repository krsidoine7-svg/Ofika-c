-- =====================================================
-- CRÉATION DE LA TABLE ORDERS
-- =====================================================

create table if not exists public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null, -- Le type doit correspondre à users.id
  order_number text not null,
  
  -- Détails de la commande
  card_type text not null default 'nfc_qr',
  quantity integer not null default 1,
  
  -- Montants (en centimes pour précision)
  amount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  
  -- Colonne générée pour le total en centimes
  total_cents integer generated always as (amount_cents + shipping_cents + tax_cents) stored,
  
  -- Colonnes de compatibilité pour le frontend (total_amount)
  -- Nous allons utiliser une vue ou simplement stocker la valeur aussi pour simplifier
  total_amount numeric generated always as ((amount_cents + shipping_cents + tax_cents) / 100.0) stored,
  
  currency text not null default 'XOF',
  
  -- Statuts
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  payment_status text not null default 'pending', -- pending, paid, failed
  shipping_status text not null default 'pending', -- pending, shipped, delivered
  
  payment_method text null, -- lygos, wave, etc.
  payment_provider text null, -- lygos
  
  -- Infos livraison
  shipping_address jsonb null,
  tracking_number text null,
  estimated_delivery timestamp with time zone null,
  actual_delivery timestamp with time zone null,
  
  -- Métadonnées
  metadata jsonb null,
  
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number)
) TABLESPACE pg_default;

-- Index pour les performances
create index if not exists idx_orders_user_id on public.orders using btree (user_id);
create index if not exists idx_orders_created_at on public.orders using btree (created_at desc);

-- Trigger pour la mise à jour automatique de updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_orders_updated_at before update
on public.orders for each row
execute function update_updated_at_column();

-- =====================================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- =====================================================

alter table public.orders enable row level security;

-- Politique de lecture : l'utilisateur ne voit que ses commandes
create policy "Users can view own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

-- Politique d'insertion : l'utilisateur ne crée que pour lui-même
create policy "Users can create own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

-- Politique de modification : interdite pour l'utilisateur (géré par serveur/admin)
-- Sauf peut-être pour annuler une commande en attente ? Pour l'instant on bloque.
