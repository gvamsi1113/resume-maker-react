'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link, PDFDownloadLink } from '@react-pdf/renderer';
import { type ResumeResponse, type EnhancedResumeData, type WorkExperience, type EducationEntry, type SkillCategory, type ProjectEntry, type CertificateEntry, type SocialLink } from '@/types/resume';

// Register a common font (optional, but good for consistency)
// Ensure you have font files in your public directory, e.g., public/fonts/
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: '/fonts/Roboto-Regular.ttf' },
//     { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
//     { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic' },
//   ],
// });

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        // fontFamily: 'Roboto', // Use registered font
        fontSize: 10,
        lineHeight: 1.4,
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    contactInfo: {
        fontSize: 9,
        marginBottom: 2,
        color: 'grey',
    },
    contactLink: {
        color: 'blue',
        textDecoration: 'underline',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingBottom: 3,
        textTransform: 'uppercase',
    },
    subsection: {
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    company: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    dates: {
        fontSize: 9,
        color: '#555555',
        marginBottom: 3,
    },
    listItem: {
        marginLeft: 10,
        marginBottom: 2,
    },
    skillsContainer: {
        // flexDirection: 'row', // SkillCategory will now be blocks
        // flexWrap: 'wrap',
    },
    skillCategory: {
        // marginRight: 15, // Not needed if categories are block
        marginBottom: 10, // Space between categories
        // minWidth: '45%', 
    },
    skillCategoryTitle: {
        fontWeight: 'bold',
        fontSize: 10,
        marginBottom: 3,
    },
    paragraph: {
        textAlign: 'justify', // For a block-style summary
    },
    // Add more styles as needed
});

// Helper to render personal info links
const ContactLinkItem = ({ label, value, isEmail = false, isSocial = false, platform }: { label?: string; value?: string, isEmail?: boolean, isSocial?: boolean, platform?: string }) => {
    if (!value) return null;
    const href = isEmail ? `mailto:${value}` : (value.startsWith('http') ? value : `https://${value}`);
    const displayLabel = isSocial ? platform : label;
    return (
        <Text style={styles.contactInfo}>
            {displayLabel ? `${displayLabel}: ` : ''}<Link src={href} style={styles.contactLink}>{value}</Link>
        </Text>
    );
};


// The PDF Document Component
const ResumeDocument: React.FC<{ resume: EnhancedResumeData }> = ({ resume }) => {
    const fullName = `${resume.first_name || ''} ${resume.last_name || ''}`.trim();
    return (
        <Document title={fullName ? `${fullName} - Resume` : 'Resume'}>
            <Page size="A4" style={styles.page}>
                {/* Header: Name & Contact */}
                <View style={styles.header}>
                    {fullName && <Text style={styles.name}>{fullName}</Text>}
                    {resume.email && <ContactLinkItem label="Email" value={resume.email} isEmail />}
                    {resume.phone && <Text style={styles.contactInfo}>Phone: {resume.phone}</Text>}
                    {resume.location && <Text style={styles.contactInfo}>Location: {resume.location}</Text>}
                    {resume.socials && resume.socials.map((social: SocialLink, index: number) => (
                        <ContactLinkItem key={index} value={social.url} isSocial platform={social.platform} />
                    ))}
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.paragraph}>{resume.summary}</Text>
                    </View>
                )}

                {/* Work Experience */}
                {resume.work && resume.work.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {resume.work.map((exp: WorkExperience, index: number) => (
                            <View key={index} style={styles.subsection}>
                                {exp.position && <Text style={styles.jobTitle}>{exp.position}</Text>}
                                {exp.name && <Text style={styles.company}>{exp.name}{resume.location ? `, ${resume.location}` : ''}</Text>} {/* Assuming company location is main resume location, adjust if exp has its own location */}
                                {(exp.startDate || exp.endDate) && (
                                    <Text style={styles.dates}>
                                        {exp.startDate} - {exp.endDate || 'Present'}
                                    </Text>
                                )}
                                {exp.story && <Text style={{ marginBottom: 3, fontSize: 9.5 }}>{exp.story}</Text>}
                                {exp.highlights && exp.highlights.map((highlight: string, i: number) => (
                                    <Text key={i} style={styles.listItem}>• {highlight}</Text>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {resume.education.map((edu: EducationEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                {edu.studyType && <Text style={styles.jobTitle}>{edu.studyType}{edu.area ? ` in ${edu.area}` : ''}</Text>}
                                {edu.institution && <Text style={styles.company}>{edu.institution}</Text>}
                                {(edu.endDate || edu.gpa) && (
                                    <Text style={styles.dates}>
                                        {/* Assuming endDate is graduation date. Add startDate if available/needed */}
                                        {edu.endDate} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                                    </Text>
                                )}
                                {edu.achievements && edu.achievements.map((ach: string, i: number) => (
                                    <Text key={i} style={styles.listItem}>• {ach}</Text>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {resume.skills.map((skillCat: SkillCategory, catIndex: number) => (
                                skillCat.category && skillCat.skills && skillCat.skills.length > 0 ? (
                                    <View key={catIndex} style={styles.skillCategory}>
                                        <Text style={styles.skillCategoryTitle}>{skillCat.category}</Text>
                                        {skillCat.skills.map((skill: string, skillIndex: number) => (
                                            <Text key={skillIndex} style={styles.listItem}>• {skill}</Text>
                                        ))}
                                    </View>
                                ) : null
                            ))}
                        </View>
                    </View>
                )}

                {/* Projects */}
                {resume.projects && resume.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {resume.projects.map((proj: ProjectEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <Text style={styles.jobTitle}>{proj.name}</Text>
                                {proj.description && <Text>{proj.description}</Text>}
                                {proj.technologies_used && proj.technologies_used.length > 0 && (
                                    <Text style={styles.dates}>Technologies: {proj.technologies_used.join(', ')}</Text>
                                )}
                                {proj.link && <ContactLinkItem label="Link" value={proj.link} />}
                            </View>
                        ))}
                    </View>
                )}

                {/* Certifications */}
                {resume.certificates && resume.certificates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {resume.certificates.map((cert: CertificateEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <Text style={styles.jobTitle}>{cert.name}</Text>
                                {cert.issuing_organization && <Text style={styles.company}>{cert.issuing_organization}</Text>}
                                {cert.date_obtained && <Text style={styles.dates}>Obtained: {cert.date_obtained}</Text>}
                                {cert.url && <ContactLinkItem label="View" value={cert.url} />}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {resume.languages && resume.languages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        {resume.languages.map((lang: string, index: number) => (
                            <Text key={index} style={styles.listItem}>• {lang}</Text>
                        ))}
                    </View>
                )}

                {/* Other Extracted Data */}
                {resume.other_extracted_data && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Information</Text>
                        <Text>{resume.other_extracted_data}</Text>
                    </View>
                )}

            </Page>
        </Document>
    );
};

interface ResumeViewProps {
    resumeData: ResumeResponse;
}

const ResumeView: React.FC<ResumeViewProps> = ({ resumeData }) => {
    // Check for the new data structure path
    if (!resumeData || !resumeData.enhanced_resume_data) {
        return <div className="p-4 text-white">Loading resume data or data is not available...</div>; // Changed to div for non-PDF context
    }

    const structuredData = resumeData.enhanced_resume_data; // Use the correct property
    const fileName = (structuredData.first_name || structuredData.last_name)
        ? `${(structuredData.first_name || '')}_${(structuredData.last_name || '')}_Resume.pdf`.replace(/_Resume.pdf$/, 'Resume.pdf').replace(/^_+|_+$/g, '')
        : 'resume.pdf';

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Generated Resume Preview</h2>
            <p className="mb-6 text-gray-300">
                Review the generated PDF below. You can download it using the link.
                This is a preliminary version based on the structured data extracted by the AI.
            </p>

            <PDFDownloadLink
                document={<ResumeDocument resume={structuredData} />}
                fileName={fileName}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out inline-block mb-6"
            >
                {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
            </PDFDownloadLink>

            {/* Placeholder for the Registration Form - to be added next */}
            <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-white">Next Steps: Register Your Profile</h3>
                <p className="text-gray-400 mb-4">
                    If you are happy with the resume, you can proceed to register.
                    Your details (Name, Email, Phone) will be pre-filled.
                </p>
                {/* Registration form component will go here */}
                <div className="text-center text-gray-500 italic">
                    Registration form will appear here.
                </div>
            </div>
        </div>
    );
};

export default ResumeView; 