import Image from 'next/image'

type ProfileAvatarProps = {
  imageUrl?: string | null
  name: string
  className?: string
  imageClassName?: string
}

export default function ProfileAvatar({
  imageUrl,
  name,
  className = 'h-12 w-12',
  imageClassName = '',
}: ProfileAvatarProps) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-slate-950 to-teal-700 font-bold text-white ${className}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${name} profile`}
          fill
          unoptimized
          sizes="160px"
          className={`object-cover ${imageClassName}`}
        />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  )
}
