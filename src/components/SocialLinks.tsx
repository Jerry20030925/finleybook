import React from 'react';
import { FaLinkedin, FaTiktok, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

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
            url: 'https://www.tiktok.com/@finleybook',
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
        <div className="flex items-center space-x-6">
            {socialMedia.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer" // Security best practice
                    className={`text-gray-400 transition-colors duration-300 ${social.color}`}
                    aria-label={social.name}
                >
                    {social.icon}
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
