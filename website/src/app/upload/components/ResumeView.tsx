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
        lineHeight: 1.3, // Slightly reduced line height for compactness
        textAlign: 'justify', // Justify text globally
    },
    header: {
        textAlign: 'center',
        marginBottom: 10, // Reduced space
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15, // Increased space
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 2, // Reduced space
    },
    contactInfoItem: {
        fontSize: 9,
        color: 'grey',
        marginHorizontal: 4, // Slightly reduced space
    },
    contactInfo: {
        fontSize: 9,
        marginBottom: 1, // Reduced space
        color: 'grey',
    },
    contactLink: {
        color: 'blue',
        textDecoration: 'underline',
    },
    section: {
        marginBottom: 5, // Reduced space
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
        marginBottom: 4, // Reduced space
    },
    jobTitleAndDatesRow: { // New style for the row containing job title and dates
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Ensuring this is 'center' for vertical centering
        marginBottom: 1, // Minimal space before company name
    },
    jobTitleWrapper: { // New style for the View wrapping the job title Text
        flex: 1, // Takes available space
        marginRight: 10, // Space between job title and dates
        // justifyContent: 'center', // If needed for text within this wrapper
    },
    jobTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        // flex: 1 and marginRight moved to jobTitleWrapper
    },
    datesWrapper: { // New style for the View wrapping the dates Text
        // This View helps in making the dates part a clear flex item for alignment.
        // justifyContent: 'center', // If needed for text within this wrapper
    },
    company: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    dates: {
        fontSize: 9,
        color: '#333333',
        textAlign: 'right', // Ensure dates are right-aligned within their own text box
    },
    listItem: {
        flexDirection: 'row', // For bullet alignment
        marginBottom: 1.5, // Adjusted for consistent line/bullet spacing
    },
    listItemText: { // New style for the text part of the list item
        flex: 1, // Allow text to wrap
        marginLeft: 5, // Indent text from bullet
    },
    skillsContainer: {
        // No specific container styles needed for new layout
    },
    skillCategory: {
        // Removed flex properties, this View is now just for margin between skill lines
        marginBottom: 3,
    },
    skillCategoryTitle: {
        fontWeight: 'bold',
        fontSize: 10,
        // marginRight: 5, // Removed, as it's part of the same Text flow
    },
    skillListText: {
        fontSize: 9.5,
        // flex: 1, // Removed, no longer a flex item
        lineHeight: 1.4, // Adjusted for better readability if text wraps
    },
    paragraph: {
        marginBottom: 5, // Ensure summary also has some bottom margin if needed
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


// The PDF Document Component
const ResumeDocument: React.FC<{ resume: EnhancedResumeData }> = ({ resume }) => {
    const fullName = `${resume.first_name || ''} ${resume.last_name || ''}`.trim();
    return (
        <Document title={fullName ? `${fullName} - Resume` : 'Resume'}>
            <Page size="A4" style={styles.page}>
                {/* Header: Name & Contact */}
                <View style={styles.header}>
                    {fullName && <Text style={styles.name}>{fullName}</Text>}
                    <View style={styles.contactRow}>
                        {resume.email && <ContactLinkItem value={resume.email} isEmail />}
                        {resume.phone && <Text style={styles.contactInfoItem}>{resume.phone}</Text>}
                        {resume.location && <Text style={styles.contactInfoItem}>{resume.location}</Text>}
                        {resume.socials && resume.socials.map((social: SocialLink, index: number) => (
                            <ContactLinkItem key={index} value={social.url} />
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