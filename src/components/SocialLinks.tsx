import React from 'react';
import { FaLinkedin, FaTiktok, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const SocialLinks = () => {
    const socialMedia = [
        {
            name: 'LinkedIn',
            icon: <FaLinkedin size={24} />,
            url: 'https://www.linkedin.com/company/finleybook',
            color: 'hover:text-blue-600',
        },
        {
            name: 'TikTok',
            icon: <FaTiktok size={24} />,
            url: 'https://www.tiktok.com/@finleybook1?_r=1&_t=ZS-923DYtBDdrs',
            color: 'hover:text-black',
        },
        {
            name: 'Instagram',
            icon: <FaInstagram size={24} />,
            url: 'https://www.instagram.com/finleybook1',
            color: 'hover:text-pink-600',
        },
        {
            name: 'X',
            icon: <FaXTwitter size={24} />,
            url: 'https://x.com/finleybook1',
            color: 'hover:text-black',
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="flex items-center space-x-6"
        >
            {socialMedia.map((social) => (
                <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors duration-300 ${social.color} p-2`}
                    aria-label={social.name}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {social.icon}
                </motion.a>
            ))}
        </motion.div>
    );
};

export default SocialLinks;
