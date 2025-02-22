import {
  SignedIn,
  UserButton
} from '@clerk/nextjs'

export default function HomePage() {
  return (
    <>
      <header>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <h1 className="p-12 text-4xl">
        Hello!
      </h1>
    </>
  )
}
