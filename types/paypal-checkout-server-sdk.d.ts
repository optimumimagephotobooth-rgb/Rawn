declare module '@paypal/checkout-server-sdk' {
  export interface PayPalEnvironment {
    clientId(): string
    clientSecret(): string
  }

  export class SandboxEnvironment implements PayPalEnvironment {
    constructor(clientId: string, clientSecret: string)
    clientId(): string
    clientSecret(): string
  }

  export class LiveEnvironment implements PayPalEnvironment {
    constructor(clientId: string, clientSecret: string)
    clientId(): string
    clientSecret(): string
  }

  export class PayPalHttpClient {
    constructor(environment: PayPalEnvironment)
    execute(request: any): Promise<any>
  }

  export namespace orders {
    export class OrdersGetRequest {
      constructor(orderId: string)
      requestBody(body: any): void
    }
    export class OrdersCaptureRequest {
      constructor(orderId: string)
      requestBody(body: any): void
    }
    export class OrdersCreateRequest {
      constructor()
      prefer(value: string): void
      requestBody(body: any): void
    }
  }

  export default {
    core: {
      SandboxEnvironment,
      LiveEnvironment,
      PayPalHttpClient,
    },
    orders,
  }
}
