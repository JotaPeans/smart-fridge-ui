import { z } from "zod";

export const GatewayTypeSchema = z.enum(["ABACATEPAY", "MERCADOPAGO"]);
export type GatewayType = z.infer<typeof GatewayTypeSchema>;

export const GATEWAY_TYPE_LABEL: Record<GatewayType, string> = {
  ABACATEPAY: "AbacatePay",
  MERCADOPAGO: "Mercado Pago",
};

export const RegimeTributarioSchema = z.enum(["MEI", "ME"]);
export type RegimeTributarioType = z.infer<typeof RegimeTributarioSchema>;

export const REGIME_TRIBUTARIO_LABEL: Record<RegimeTributarioType, string> = {
  MEI: "MEI — Microempreendedor Individual",
  ME: "ME — Microempresa",
};

export const NfcPlatformSchema = z.enum(["SPEDY", "NFC_IO"]);
export type NfcPlatformType = z.infer<typeof NfcPlatformSchema>;

export const NFC_PLATFORM_LABEL: Record<NfcPlatformType, string> = {
  SPEDY: "Spedy",
  NFC_IO: "NFC.io",
};

export const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/[0-9A-Z]{4}-\d{2}$/;

export const FridgeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable(),
  cep: z.string(),
  lat: z.number(),
  lng: z.number(),
  serialNumber: z.string(),
  status: z.enum(["online", "offline", "maintenance"]),
  active: z.boolean(),
  adminId: z.string(),
  cnpj: z.string(),
  regimeTributario: RegimeTributarioSchema,
  nfcPlatform: NfcPlatformSchema.nullable(),
  gatewayType: GatewayTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FridgeResponseType = z.infer<typeof FridgeResponseSchema>;

/** Shape returned by `GET /fridge/:id` for role `USER` — no operational fields. */
export const PublicFridgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable(),
  cep: z.string(),
  lat: z.number(),
  lng: z.number(),
  status: z.enum(["online", "offline", "maintenance"]),
  cnpj: z.string(),
  regimeTributario: RegimeTributarioSchema,
  gatewayType: GatewayTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PublicFridgeType = z.infer<typeof PublicFridgeSchema>;

export const CreateFridgeSchema = z.object({
  name: z.string().min(1, "Obrigatório").max(255),
  location: z.string().max(255).optional(),
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  serialNumber: z.string().min(1, "Obrigatório"),
  adminId: z.string().min(1, "Selecione um admin"),
  cnpj: z.string().regex(CNPJ_REGEX, "CNPJ inválido"),
  regimeTributario: RegimeTributarioSchema,
  nfcPlatform: NfcPlatformSchema.optional(),
  paymentCredential: z.string().optional(),
  gatewayType: GatewayTypeSchema.optional(),
  gatewayCardMachineId: z.string().optional(),
});
export type CreateFridgeType = z.infer<typeof CreateFridgeSchema>;

export const UpdateFridgeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  location: z.string().max(255).nullable().optional(),
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  serialNumber: z.string().min(1).optional(),
  adminId: z.string().min(1).optional(),
  cnpj: z.string().regex(CNPJ_REGEX, "CNPJ inválido").optional(),
  regimeTributario: RegimeTributarioSchema.optional(),
  nfcPlatform: NfcPlatformSchema.optional(),
  nfcApiKey: z.string().nullable().optional(),
  paymentCredential: z.string().nullable().optional(),
  gatewayType: GatewayTypeSchema.optional(),
  gatewayCardMachineId: z.string().optional(),
});
export type UpdateFridgeType = z.infer<typeof UpdateFridgeSchema>;
