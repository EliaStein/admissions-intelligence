import React from 'react';
import Image from 'next/image';

interface CharacterProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  image: string;
}

export default function Character({ icon, name, description, image }: CharacterProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-xl transition-all hover:-translate-y-2">
      <div className="aspect-square overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 p-6 text-white">
          <div className="mb-2">{icon}</div>
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-sm text-gray-200">{description}</p>
        </div>
      </div>
    </div>
  );
}