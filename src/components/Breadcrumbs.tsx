'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

export interface BreadcrumbItem {
    name: string
    url?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

import StructuredData from './StructuredData'

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <StructuredData
                type="breadcrumbs"
                data={items}
            />
            <ol role="list" className="flex items-center space-x-2">
                <li>
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-gray-500 transition-colors">
                            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </div>
                </li>

                {items.map((item, index) => (
                    <li key={item.name}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            {item.url ? (
                                <Link
                                    href={item.url}
                                    className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span className="ml-2 text-sm font-medium text-gray-700" aria-current="page">
                                    {item.name}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
