
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
