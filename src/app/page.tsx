"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Home() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phoneNumber: '',
		serviceAddress: '',
		workOrderDescription: '',
    tenantName: '',
		timeAvailability: ''
	});
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		const response = await fetch('/api/tickets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		});
		if (response.ok) {
			toast.success('Ticket submitted successfully', {
				className: 'text-xl'
			});
			setFormData({
				name: '',
				email: '',
				phoneNumber: '',
				serviceAddress: '',
				workOrderDescription: '',
        tenantName: '',
				timeAvailability: ''
			});
		} else {
			const data = await response.json();
			toast.error(data.error, {
				className: 'text-xl'
			});
		}
    setLoading(false);
	};

	return (
		<div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center bg-gray-100">
			<h1 className="text-3xl font-bold mb-6 text-gray-800">Submit a Ticket</h1>
			<form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Name</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Email</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Phone Number</label>
					<input
						type="text"
						name="phoneNumber"
						value={formData.phoneNumber}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Service Address</label>
					<input
						type="text"
						name="serviceAddress"
						value={formData.serviceAddress}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Work Order Description</label>
					<textarea
						name="workOrderDescription"
						value={formData.workOrderDescription}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
        <div className="mb-4">
					<label className="block mb-2 text-gray-700">If Rental, add Tenat name and phone number</label>
					<textarea
						name="tennantName"
						value={formData.tenantName}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Time Availability</label>
					<input
						type="text"
						name="timeAvailability"
						value={formData.timeAvailability}
						onChange={handleInputChange}
						className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>
				<button
					type="submit"
					className="bg-green-600 hover:bg-green-700 text-white p-3 rounded shadow-lg transition duration-300 w-full"
				>
					Submit
				</button>
				{loading && (
					<div className="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
						<div className="loader"></div>
					</div>
				)}
			</form>
		</div>
	);
}