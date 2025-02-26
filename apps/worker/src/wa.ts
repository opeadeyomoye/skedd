
export const messages = {
  sendText(env: WorkerBindings, number: string, text: string) {
    const url = `https://graph.facebook.com/v21.0/${env.WA_BUSINESS_PHONE_ID}/messages`
    const init: RequestInit = {
      method: 'post',
      headers: {
        Authorization: `Bearer ${env.META_APP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `${number}`,
        type: 'text',
        text: {
          // preview_url: true, // doesn't work just yet
          body: text
        }
      })
    }

    return fetch(url, init)
  }
}

export namespace Payloads {
  export interface TextMessage {
    object: 'whatsapp_business_account'
    entry: Entry[]
  }

  type Entry = {
    id: string
    changes: Change[]
  }

  type Change = {
    value: Value
    field: string
  }

  type Value = {
    messaging_product: 'whatsapp'
    metadata: Metadata
    contacts: Contact[]
    messages: Message[]
  }

  type Contact = {
    profile: Profile
    wa_id: string
  }

  type Profile = {
    name: string
  }

  type Message = {
    from: string
    id: string
    timestamp: string
    text: { body: string }
    type: string
  }

  type Metadata = {
    display_phone_number: string
    phone_number_id: string
  }
}
