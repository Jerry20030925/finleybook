
import { Metadata } from 'next'
import { PRODUCTS } from '@/data/products'
import ProductDetailContent from '@/components/ProductDetailContent'
import StructuredData from '@/components/StructuredData'
import Link from 'next/link'

interface PageProps {
    params: {
        id: string
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const product = PRODUCTS.find(p => p.id === params.id)

    if (!product) {
        return {
            title: 'Product Not Found - FinleyBook',
            description: 'The requested product could not be found.',
        }
    }

    return {
        title: `${product.name} - Best Cashback & Deals | FinleyBook`,
        description: `Get ${((product.cashbackRate || 0) * 100).toFixed(0)}% cashback on ${product.name}. Compare prices from ${product.offers?.length || 1} retailers and save money today.`,
        openGraph: {
            title: `Save on ${product.name} - FinleyBook Wealth Vault`,
            description: `Best price: $${product.price}. Earn cashback and find hidden discounts.`,
            images: [product.image],
        }
    }
}

export default function ProductDetailPage({ params }: PageProps) {
    const product = PRODUCTS.find(p => p.id === params.id)

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <Link href="/wealth" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Back to Wealth Vault
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <StructuredData type="product" data={product} />
            <ProductDetailContent product={product} />
        </>
    )
}
