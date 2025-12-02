"use client";

import React, {  use } from 'react'; // Import use for Params
import { toolRegistry } from '../../../lib/registry';

import { notFound } from 'next/navigation';

export default function ToolPage({ params }) {
  const { category, slug } = use(params);

  const toolKey = `${category}/${slug}`;
  const ToolComponent = toolRegistry[toolKey];

  if (!ToolComponent) {
    return notFound();
  }

  return (
     <ToolComponent />
  );
}