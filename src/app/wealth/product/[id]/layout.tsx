import { Metadata } from 'next'
import { PRODUCTS } from '@/data/products'

type Props = {
    params: { id: string }
    children: React.ReactNode
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const product = PRODUCTS.find((p) => p.id === params.id)

    if (!product) {
        return {
            title: 'Product Not Found | FinleyBook',
        }
    }

    return {
        title: `${product.name} - Best Price & Cashback | FinleyBook`,
        description: `Get ${product.cashbackRate * 100}% cashback on ${product.name}. Compare specific offers from ${product.offers.length} merchants.`,
        openGraph: {
            images: [product.image],
        },
        alternates: {
            canonical: `/wealth/product/${product.id}`,
        },
    }
}

export default function ProductLayout({
    children,
}: Props) {
    return children
}
