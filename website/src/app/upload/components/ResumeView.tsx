'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { type ResumeResponse, type EnhancedResumeData, type WorkExperience, type EducationEntry, type SkillCategory, type ProjectEntry, type CertificateEntry, type SocialLink } from '@/types/resume';
import BentoBox from '@/components/ui/BentoBox';

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
        fontSize: 10,
        lineHeight: 1.3,
        textAlign: 'justify',
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 2,
    },
    contactInfoItem: {
        fontSize: 9,
        color: 'grey',
        marginHorizontal: 4,
    },
    contactInfo: {
        fontSize: 9,
        marginBottom: 1,
        color: 'grey',
    },
    contactLink: {
        color: 'blue',
        textDecoration: 'underline',
    },
    section: {
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingBottom: 3,
        textTransform: 'uppercase',
    },
    subsection: {
        marginBottom: 4,
    },
    jobTitleAndDatesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 1,
    },
    jobTitleWrapper: {
        flex: 1,
        marginRight: 10,
    },
    jobTitle: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    datesWrapper: {
    },
    company: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    dates: {
        fontSize: 9,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 1.5,
    },
    listItemText: {
        flex: 1,
        marginLeft: 5,
    },
    skillsContainer: {
    },
    skillCategory: {
        marginBottom: 3,
    },
    skillCategoryTitle: {
        fontWeight: 'bold',
        fontSize: 10,
    },
    skillListText: {
        fontSize: 9.5,
        lineHeight: 1.4,
    },
    paragraph: {
        marginBottom: 5,
    },
});

// Date Formatter Helper
const formatDate = (dateString?: string, isEndDatePresent?: boolean): string => {
    if (isEndDatePresent && dateString === 'Present') return 'Present';
    if (!dateString) return '';

    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts.length > 1 ? parts[1] : '';

    if (month) {
        const monthDate = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long' });
        return `${monthName} ${year}`;
    }
    return year;
};

// Helper to render personal info links (simplified to remove labels)
const ContactLinkItem = ({ value, isEmail = false }: { value?: string, isEmail?: boolean }) => {
    if (!value) return null;
    const href = isEmail ? `mailto:${value}` : (value.startsWith('http') ? value : `https://${value}`);
    return (
        <Text style={styles.contactInfoItem}>
            <Link src={href} style={styles.contactLink}>{value}</Link>
        </Text>
    );
};

// Define a more specific type for items in the 'otherData' array
type OtherInfoItem =
    | { achievement: string; section_title?: undefined; content?: undefined; } // Explicitly make other fields undefined
    | { achievement?: undefined; section_title: string; content: string[]; }   // Explicitly make other fields undefined
    | string;

// The PDF Document Component
const ResumeDocument: React.FC<{ resume: EnhancedResumeData }> = ({ resume }) => {
    const fullName = `${resume.first_name || ''} ${resume.last_name || ''}`.trim();

    // Create an array to hold contact elements
    const contactElements: React.JSX.Element[] = [];
    if (resume.email) {
        contactElements.push(<ContactLinkItem key="email" value={resume.email} isEmail />);
    }
    if (resume.phone) {
        contactElements.push(<Text key="phone" style={styles.contactInfoItem}>{resume.phone}</Text>);
    }
    if (resume.location) {
        contactElements.push(<Text key="location" style={styles.contactInfoItem}>{resume.location}</Text>);
    }
    if (resume.socials) {
        resume.socials.forEach((social: SocialLink, index: number) => {
            if (social.url) { // Ensure URL exists before adding
                contactElements.push(<ContactLinkItem key={`social-${index}`} value={social.url} />);
            }
        });
    }

    return (
        <Document title={fullName ? `${fullName} - Resume` : 'Resume'}>
            <Page size="A4" style={styles.page}>
                {/* Header: Name & Contact */}
                <View style={styles.header}>
                    {fullName && <Text style={styles.name}>{fullName}</Text>}
                    <View style={styles.contactRow}>
                        {contactElements.map((element, index) => (
                            <React.Fragment key={index}>
                                {element}
                                {index < contactElements.length - 1 && (
                                    <Text style={styles.contactInfoItem}> | </Text>
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.paragraph}>{resume.summary}</Text>
                    </View>
                )}

                {/* Work Experience */}
                {resume.work && resume.work.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {resume.work.map((exp: WorkExperience, index: number) => (
                            <View key={index} style={styles.subsection} wrap={false}>
                                <View style={styles.jobTitleAndDatesRow}>
                                    <View style={styles.jobTitleWrapper}>
                                        {exp.position && <Text style={styles.jobTitle}>{exp.position}</Text>}
                                    </View>
                                    <View style={styles.datesWrapper}>
                                        {(exp.startDate || exp.endDate) && (
                                            <Text style={styles.dates}>
                                                {formatDate(exp.startDate)} - {formatDate(exp.endDate, exp.endDate === 'Present' || !exp.endDate)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {exp.name && <Text style={styles.company}>{exp.name}{resume.location ? `, ${resume.location}` : ''}</Text>} {/* Assuming company location is main resume location, adjust if exp has its own location */}
                                {exp.highlights && exp.highlights.map((highlight: string, i: number) => (
                                    <View key={i} style={styles.listItem}>
                                        <Text>•</Text>
                                        <Text style={styles.listItemText}>{highlight}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {resume.education.map((edu: EducationEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <View style={styles.jobTitleAndDatesRow}>
                                    <View style={styles.jobTitleWrapper}>
                                        {edu.studyType && <Text style={styles.jobTitle}>{edu.studyType}{edu.area ? ` in ${edu.area}` : ''}</Text>}
                                    </View>
                                    <View style={styles.datesWrapper}>
                                        {(edu.endDate || edu.gpa) && (
                                            <Text style={styles.dates}>
                                                {formatDate(edu.endDate)} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {edu.institution && <Text style={styles.company}>{edu.institution}</Text>}
                                {edu.achievements && edu.achievements.map((ach: string, i: number) => (
                                    <View key={i} style={styles.listItem}>
                                        <Text>•</Text>
                                        <Text style={styles.listItemText}>{ach}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {resume.skills.map((skillCat: SkillCategory, catIndex: number) => (
                                skillCat.category && skillCat.skills && skillCat.skills.length > 0 ? (
                                    <View key={catIndex} style={styles.skillCategory}>
                                        <Text style={styles.skillListText}>
                                            <Text style={styles.skillCategoryTitle}>{skillCat.category}: </Text>
                                            {skillCat.skills.join(', ')}
                                        </Text>
                                    </View>
                                ) : null
                            ))}
                        </View>
                    </View>
                )}

                {/* Projects */}
                {resume.projects && resume.projects.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {resume.projects.map((proj: ProjectEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <Text style={styles.jobTitle}>{proj.name}</Text>
                                {proj.description && <Text>{proj.description}</Text>}
                                {proj.technologies_used && proj.technologies_used.length > 0 && (
                                    <Text style={styles.dates}>Technologies: {proj.technologies_used.join(', ')}</Text>
                                )}
                                {proj.link && <ContactLinkItem value={proj.link} />}
                            </View>
                        ))}
                    </View>
                )}

                {/* Certifications */}
                {resume.certificates && resume.certificates.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {resume.certificates.map((cert: CertificateEntry, index: number) => (
                            <View key={index} style={styles.subsection}>
                                <Text style={styles.jobTitle}>{cert.name}</Text>
                                {cert.issuing_organization && <Text style={styles.company}>{cert.issuing_organization}</Text>}
                                {cert.date_obtained && <Text style={styles.dates}>Obtained: {cert.date_obtained}</Text>}
                                {cert.url && <ContactLinkItem value={cert.url} />}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {resume.languages && resume.languages.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <Text style={styles.skillListText}>{resume.languages.join(', ')}</Text>
                    </View>
                )}

                {/* Other Extracted Data / Achievements */}
                {resume.other_extracted_data && Array.isArray(resume.other_extracted_data) && resume.other_extracted_data.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        {/* Attempt to find a common title or use a generic one */}
                        {/* This part is speculative as the structure isn't uniform for section_title */}
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        {resume.other_extracted_data.map((item: any, index: number) => (
                            <View key={index} style={styles.listItem}>
                                <Text>•</Text>
                                {item.achievement && (
                                    <Text style={styles.listItemText}>{item.achievement}</Text>
                                )}
                                {item.section_title && item.content && Array.isArray(item.content) && (
                                    // If it has section_title and content, render that (though data suggests this isn't the case)
                                    <View style={{ marginLeft: 5, flex: 1 }}>{/* Added View for proper structure if this path is taken */}
                                        <Text style={styles.skillCategoryTitle}>{item.section_title}</Text>
                                        {item.content.map((line: string, lineIndex: number) => (
                                            <Text key={lineIndex} style={styles.listItemText}>{line}</Text>
                                        ))}
                                    </View>
                                )}
                                {/* Fallback for other unexpected structures, ensuring text is wrapped */}
                                {!(item.achievement || (item.section_title && item.content)) && typeof item === 'string' && (
                                    <Text style={styles.listItemText}>{item}</Text>
                                )}
                            </View>
                        ))}
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
        return <div className="text-red-500">Something went wrong. Please try again.</div>;
    }

    const structuredData = resumeData.enhanced_resume_data; // Use the correct property
    const fileName = (structuredData.first_name || structuredData.last_name)
        ? `${(structuredData.first_name || '')}_${(structuredData.last_name || '')}_Resume.pdf`.replace(/_Resume.pdf$/, 'Resume.pdf').replace(/^_+|_+$/g, '')
        : 'resume.pdf';

    return (
        <BentoBox className="flex flex-col p-0 items-center justify-center w-full h-full">
            {/* New relative container for PDF and Download Button */}
            <div className="relative w-full h-full">
                <div className="w-full h-full overflow-hidden border border-gray-700 rounded-md bg-white">
                    {typeof window !== 'undefined' && (
                        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                            <ResumeDocument resume={structuredData} />
                        </PDFViewer>
                    )}
                </div>

                <PDFDownloadLink
                    document={<ResumeDocument resume={structuredData} />}
                    fileName={fileName}
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-150 ease-in-out"
                >
                    {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
                </PDFDownloadLink>
            </div>
        </BentoBox>
    );
};

export default ResumeView; 