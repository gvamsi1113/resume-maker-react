import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface BaseFormFieldProps {
    id: string;
    label: string;
    error?: string;
    className?: string;
}

interface InputFormFieldProps extends BaseFormFieldProps {
    type: 'text' | 'email' | 'password' | 'tel';
    placeholder?: string;
    register: any;
}

interface CheckboxFormFieldProps extends BaseFormFieldProps {
    type: 'checkbox';
    register: any;
    children?: React.ReactNode;
}

type FormFieldProps = InputFormFieldProps | CheckboxFormFieldProps;

export default function FormField(props: FormFieldProps) {
    const { id, label, error, className = '' } = props;

    if (props.type === 'checkbox') {
        return (
            <div className={className}>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={id}
                        {...props.register}
                    />
                    <Label htmlFor={id} className="text-sm">
                        {props.children || label}
                    </Label>
                </div>
                {error && (
                    <p className="text-red-700 text-sm mt-1 font-normal">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={props.type}
                placeholder={props.placeholder}
                className="mt-1 w-full"
                {...props.register}
            />
            {error && (
                <p className="text-red-700 text-sm mt-1 font-normal pl-1">{error}</p>
            )}
        </div>
    );
} 