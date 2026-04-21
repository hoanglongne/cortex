"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Plug, Target, Zap } from "lucide-react";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 28 },
    },
};

const services = [
    {
        id: "api-integration",
        title: "Tích Hợp API",
        description:
            "Kết nối dữ liệu CORTEX và cơ chế \"Pure Function\" trực tiếp vào hệ thống LMS hiện tại của bạn.",
        features: [
            "Đồng bộ hồ sơ ngôn ngữ thời gian thực",
            "RESTful & GraphQL endpoints",
            "Webhook tùy chỉnh",
            "Bảo mật cấp doanh nghiệp",
        ],
        icon: Plug,
    },
    {
        id: "ecosystem-integration",
        title: "Tích Hợp Hệ Sinh Thái",
        description:
            "White-label các ứng dụng hiện có (Lexica, Solilo, v.v.) và điều chỉnh độc quyền cho chương trình giảng dạy của bạn.",
        features: [
            "Tùy chỉnh thương hiệu & giao diện",
            "Nội dung phù hợp chương trình",
            "Bảng điều khiển quản trị riêng",
            "Phân tích & báo cáo học viên",
        ],
        icon: Target,
    },
    {
        id: "custom-development",
        title: "Phát Triển Công Nghệ Giáo Dục Riêng",
        description:
            "Cần một công cụ cụ thể để giải quyết vấn đề giảng dạy độc đáo? Chúng tôi thiết kế và xây dựng Web/App hoàn toàn mới, hiệu suất cao, phù hợp với phương pháp giảng dạy của trung tâm bạn.",
        features: [
            "Đội ngũ phát triển full-stack",
            "Sprint Agile 6-8 tuần",
            "Chuyển giao quyền sở hữu 100%",
            "Bảo trì & hỗ trợ liên tục",
        ],
        icon: Zap,
    },
];

export default function PartnershipSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="partnership"
            ref={ref}
            className="relative w-full overflow-hidden border-t border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-transparent via-[rgba(0,7,205,0.02)] to-transparent py-32 md:py-40"
        >
            <motion.div
                variants={container}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                className="mx-auto max-w-7xl px-6"
            >
                {/* Overline */}
                <motion.span
                    variants={item}
                    className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.5)]"
                >
                    B2B Solutions
                </motion.span>

                {/* Heading */}
                <motion.h2
                    variants={item}
                    className="mt-4 max-w-4xl font-sans text-5xl font-normal leading-[1.0] tracking-tight text-white md:text-6xl"
                >
                    Đừng Build Lại. <br />
                    Để Chúng Tôi Build Giúp Bạn.
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                    Cho dù bạn là trung tâm Anh ngữ, tổ chức giáo dục, hay nhà đầu tư —
                    chúng tôi có giải pháp phù hợp.{" "}
                    <span className="font-medium text-white">
                        Let us build the engine for you.
                    </span>
                </motion.p>

                {/* Services Grid */}
                <motion.div
                    variants={item}
                    className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.2 + index * 0.1,
                                type: "spring",
                                stiffness: 300,
                            }}
                            className="group relative flex flex-col rounded-sm border border-[rgba(255,255,255,0.3)] bg-[#000000] p-8 transition-all hover:border-[rgba(0,137,255,0.5)] hover:shadow-[0_0_30px_rgba(0,137,255,0.15)]"
                        >
                            {/* Icon */}
                            <div className="mb-6">
                                <service.icon className="h-10 w-10 text-signal-blue" strokeWidth={1.5} />
                            </div>

                            {/* Title */}
                            <h3 className="font-sans text-xl font-medium leading-tight text-white">
                                {service.title}
                            </h3>

                            {/* Description */}
                            <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">
                                {service.description}
                            </p>

                            {/* Features */}
                            <ul className="mt-6 space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-6">
                                {service.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 font-mono text-xs text-[rgba(255,255,255,0.5)]"
                                    >
                                        <span className="mt-0.5 text-signal-blue">▸</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Target Audiences */}
                <motion.div
                    variants={item}
                    className="mt-16 flex flex-wrap justify-center gap-4"
                >
                    <span className="font-mono text-sm uppercase tracking-[0.15em] text-[rgba(255,255,255,0.4)]">
                        For:
                    </span>
                    {["English Centers", "Educational Institutions", "Investors"].map(
                        (audience) => (
                            <span
                                key={audience}
                                className="rounded-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-[rgba(255,255,255,0.6)]"
                            >
                                {audience}
                            </span>
                        )
                    )}
                </motion.div>

                {/* CTA Card */}
                <motion.div
                    variants={item}
                    className="mx-auto mt-16 max-w-3xl rounded-sm border border-[rgba(255,255,255,0.3)] bg-gradient-to-br from-[rgba(0,137,255,0.08)] to-transparent p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] md:p-12"
                >
                    <h3 className="font-sans text-3xl font-normal leading-tight text-white md:text-4xl">
                        Become a Partner
                    </h3>
                    <p className="mt-4 text-base text-[rgba(255,255,255,0.6)]">
                        Let's discuss how we can build the perfect EdTech solution for your
                        organization.
                    </p>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <a
                            href="mailto:partnerships@cortexhub.edu"
                            className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-6 py-3 font-mono text-sm uppercase tracking-[0.15em] text-[#0a0a0a] transition-opacity hover:opacity-90"
                        >
                            <span>Contact Sales</span>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3 8H13M13 8L9 4M13 8L9 12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 rounded-sm border border-[rgba(255,255,255,0.2)] bg-transparent px-6 py-3 font-mono text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            <span>Download Brochure</span>
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
