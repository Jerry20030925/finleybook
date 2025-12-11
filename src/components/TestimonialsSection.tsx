'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Freelance Designer",
            image: "/static/avatar1.png", // Placeholder, will use initials if not found
            content: "I used to be terrified of checking my bank account. FinleyBook made it actually fun to save money. The weekly reports are a game changer!",
            rating: 5
        },
        {
            name: "Michael Ross",
            role: "Software Engineer",
            image: "/static/avatar2.png",
            content: "The best part is that I don't have to manually enter everything. It just works. I've saved over $2,000 in just 3 months.",
            rating: 5
        },
        {
            name: "Jessica Lee",
            role: "Marketing Manager",
            image: "/static/avatar3.png",
            content: "Finally, a finance app that doesn't feel like a spreadsheet. The design is beautiful and the insights are actually useful.",
            rating: 5
        }
    ]

    return (
        <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Loved by Thousands
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Join the community of smart savers who are taking control of their financial future.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 p-8 rounded-3xl relative"
                        >
                            <Quote className="absolute top-8 right-8 text-indigo-100 w-12 h-12" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-gray-700 text-lg mb-8 leading-relaxed relative z-10">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">{item.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
