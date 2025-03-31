import { auth } from '@clerk/nextjs/server'
import { Divider } from '@/components/divider'
import { Heading } from '@/components/heading'
import { Text, TextLink } from '@/components/text'
import apiFetch from '@/apiFetch'

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export const runtime = 'edge'

export default async function MyDevicePage() {
  const token = await (await auth()).getToken()
  if (!token) return

  let devices: { phoneMask: string, connectedAt: string }[] = []
  const response = await apiFetch(token).get('/devices')
  if (response.ok) {
    devices = await response.json()
  }

  return (
    <>
      <Heading>My Device</Heading>
      <Divider className="mt-6" />

      {devices.length ? (
        <div className="mt-6 max-w-lg grid gap-6 md:grid-cols-2">
          {devices.map(d => (
            <div key={d.phoneMask} className="px-6 py-4 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
              <h4 className="flex justify-between">
                Number ending in {d.phoneMask}
              </h4>
              <Text className="mt-6 text-xs">
                Connected {(new Date(Date.parse(`${d.connectedAt}Z`))).toDateString()}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-zinc-400">
          <p>You have not connected a device.</p>
          <p className="mt-5">
            <TextLink href={`https://wa.me/${waNumber}?text=Hi!`}>
              Say hi to skedd on WhatsApp
            </TextLink>
            {' '}
            to connect your device.
          </p>
        </div>
      )}
    </>
  )
}
