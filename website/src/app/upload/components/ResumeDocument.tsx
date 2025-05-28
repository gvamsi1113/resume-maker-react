'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { type EnhancedResumeData, type WorkExperience, type EducationEntry, type SkillCategory, type ProjectEntry, type CertificateEntry, type SocialLink } from '@/types/resume';


/** Styles for the PDF document, defining layout, fonts, and appearance of sections. */
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

/**
 * Formats a date string (YYYY-MM or YYYY) into a more readable format (Month Year or Year).
 * Handles "Present" for ongoing dates.
 *
 * @param {string} [dateString] - The date string to format.
 * @param {boolean} [isEndDatePresent] - Flag indicating if the end date is "Present".
 * @returns {string} The formatted date string.
 */
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

/** Props for the ContactLinkItem component. */
interface ContactLinkItemProps {
    /** The value to display and link to (e.g., email, URL). */
    value?: string;
    /** Indicates if the value is an email address. Defaults to false. */
    isEmail?: boolean;
}

/**
 * Renders a contact item as a clickable link.
 * Formats email links with `mailto:` and ensures other links have `https://` if not present.
 *
 * @param {ContactLinkItemProps} props - The props for the component.
 * @returns {React.JSX.Element | null} The rendered link item, or null if value is not provided.
 */
const ContactLinkItem = ({ value, isEmail = false }: ContactLinkItemProps): React.JSX.Element | null => {
    if (!value) return null;
    const href = isEmail ? `mailto:${value}` : (value.startsWith('http') ? value : `https://${value}`);
    return (
        <Text style={styles.contactInfoItem}>
            <Link src={href} style={styles.contactLink}>{value}</Link>
        </Text>
    );
};

/** Props for the ResumeDocument component. */
interface ResumeDocumentProps {
    /** The enhanced resume data to be rendered in the PDF document. */
    resume: EnhancedResumeData;
}

/**
 * ResumeDocument component defines the structure and content of the PDF resume.
 * It takes enhanced resume data and renders it into a multi-page PDF document
 * with sections for personal information, summary, work experience, education, skills, etc.
 *
 * @param {ResumeDocumentProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered PDF Document.
 */
const ResumeDocument: React.FC<ResumeDocumentProps> = ({ resume }) => {
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
                                {exp.name && <Text style={styles.company}>{exp.name}{resume.location ? `, ${resume.location}` : ''}</Text>}
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

            </Page>
        </Document>
    );
};

export default ResumeDocument; 