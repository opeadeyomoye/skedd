import { Divider } from '@/components/divider'
import { Heading } from '@/components/heading'
import { TextLink } from '@/components/text'

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export default function MyDevicePage() {
  return (
    <>
      <Heading>My Device</Heading>
      <Divider className="mt-6" />

      <div className="mt-6 text-zinc-400">
        <p>You have not connected a device.</p>
        <p className="mt-5">
          <TextLink href={`https://wa.me/${waNumber}?text=Hi!`} rel="no">
            Say hi to skedd on WhatsApp
          </TextLink>
          {' '}
          to connect your device.
        </p>
      </div>
    </>
  )
}
