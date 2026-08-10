CREATE TYPE "public"."profile_type" AS ENUM('professional', 'personal', 'event');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro', 'enterprise', 'admin');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_data" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(2),
	"city" varchar(100),
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"referrer" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_designs" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"front_design" jsonb NOT NULL,
	"back_design" jsonb NOT NULL,
	"logo_position" varchar(20) DEFAULT 'top-center',
	"text_alignment" varchar(20) DEFAULT 'center',
	"color_scheme" varchar(20) DEFAULT 'classic',
	"font_family" varchar(50) DEFAULT 'Inter',
	"font_size" varchar(10) DEFAULT 'medium',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"nfc_id" varchar(100),
	"qr_code" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cards_nfc_id_unique" UNIQUE("nfc_id")
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"widget_type" varchar(50) NOT NULL,
	"position_x" integer DEFAULT 0 NOT NULL,
	"position_y" integer DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 4 NOT NULL,
	"height" integer DEFAULT 3 NOT NULL,
	"config" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"title" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"icon" varchar(50),
	"order_index" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0,
	"position" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nfc_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text,
	"card_identifier" varchar(100) NOT NULL,
	"card_type" varchar(50) DEFAULT 'nfc_qr',
	"design_choice" varchar(50),
	"color_theme" varchar(50),
	"order_number" varchar(50),
	"production_status" varchar(50) DEFAULT 'pending',
	"delivery_status" varchar(50) DEFAULT 'pending',
	"tracking_number" varchar(100),
	"is_activated" boolean DEFAULT false,
	"activation_date" timestamp with time zone,
	"expiration_date" timestamp with time zone,
	"custom_data" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nfc_cards_card_identifier_unique" UNIQUE("card_identifier")
);
--> statement-breakpoint
CREATE TABLE "nfc_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_name" varchar(255) NOT NULL,
	"nfc_link" text NOT NULL,
	"design_choice" varchar(50) DEFAULT 'classic',
	"color_theme" varchar(50) DEFAULT 'black',
	"qr_code_data" text,
	"is_active" boolean DEFAULT true,
	"email" varchar(255),
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"facebook" text,
	"instagram" text,
	"twitter" text,
	"linkedin" text,
	"youtube" text,
	"tiktok" text,
	"website" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_number" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"card_type" varchar(50),
	"payment_method" varchar(20) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_reference" varchar(100),
	"shipping_address" jsonb NOT NULL,
	"tracking_number" varchar(100),
	"estimated_delivery" date,
	"actual_delivery" date,
	"wave_payment_id" text,
	"wave_payment_url" text,
	"Wave_payment_id" text,
	"Wave_payment_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"method_type" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_id" varchar(100),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_template_data" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"template_id" text NOT NULL,
	"fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_template_data_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_type" varchar(20),
	"name" varchar(100) NOT NULL,
	"bio" text,
	"image_url" text,
	"custom_url" varchar(100),
	"username" varchar(50),
	"email" varchar(255),
	"phone" varchar(50),
	"is_public" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"design_choice" varchar(50),
	"color_theme" varchar(50),
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"custom_links" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_custom_url_unique" UNIQUE("custom_url"),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "qr_redirects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"short_code" varchar(20) NOT NULL,
	"nfc_link" text NOT NULL,
	"redirect_type" varchar(50) DEFAULT 'custom',
	"title" varchar(200),
	"description" text,
	"scan_count" integer DEFAULT 0,
	"last_scanned_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_redirects_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "qr_scans" (
	"id" text PRIMARY KEY NOT NULL,
	"qr_redirect_id" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(2),
	"city" varchar(100),
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"referrer" varchar(500),
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_schemas" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"schema" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"category" varchar(50),
	"icon" varchar(50),
	"priority_label" varchar(50),
	"target_audience" text,
	"features" text[],
	"stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_schemas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"name" varchar(255),
	"image" text,
	"preferred_language" varchar(5) DEFAULT 'fr',
	"subscription_tier" varchar(20) DEFAULT 'free',
	"cards_ordered" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_designs" ADD CONSTRAINT "card_designs_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_profile_id_nfc_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."nfc_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_profiles" ADD CONSTRAINT "nfc_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_template_data" ADD CONSTRAINT "profile_template_data_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_template_data" ADD CONSTRAINT "profile_template_data_template_id_template_schemas_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template_schemas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_redirects" ADD CONSTRAINT "qr_redirects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_qr_redirect_id_qr_redirects_id_fk" FOREIGN KEY ("qr_redirect_id") REFERENCES "public"."qr_redirects"("id") ON DELETE cascade ON UPDATE no action;