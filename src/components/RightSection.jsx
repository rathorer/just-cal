import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";

function RightSection(props) {
	const month = props.month;
	const monthName = props.monthName;
	const year = props.year;
	let selectedDate = props.selectedDate;
	console.log(selectedDate);
	let dateObj = new Date(year, month, selectedDate);
	console.log('obj: ', dateObj);
	//const [currentDate, setCurrentDate] = useState(selectedDate);
	const [date, setDate] = useState(dateObj);
	const [items, setItems] = useState([]);

	useEffect(() => {
		async function fetchDayItems() {
			try {
				if (date) {
					let date = new Date(year, month, selectedDate);
				console.log('calling fetch_date_items.', date);
					const dayItems = await invoke("fetch_day_items", { date });
					console.log("Fetched day items:", dayItems);
					setItems(dayItems);
				}
			} catch (error) {
				console.error("Failed to fetch day items:", error);
			}
		}
		fetchDayItems();
	}, [date, selectedDate]);

	return (
		<div className="hidden lg:block w-1/5 bg-base-100/90 border-l border-base-200 text-base-content">
			<div className="text-xl p-2 border-b border-base-100">
				<h3 className="font-semibold text-base-content">{"Your day: " + monthName + " " + selectedDate + ", " + year}</h3>
			</div>

			<div className="p-2 space-y-4 overflow-y-auto h-full">
				{items.map((item, index) => (
					<div key={index} className="card bg-base-100 shadow-md">
						<div className="card-body p-4">
							<h4 className="card-title text-md">{item.item}</h4>
							<p className="text-sm">{item.status}</p>
						</div>
					</div>
				))}

				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h4 className="card-title text-md">New Item:</h4>
						<input type="text"
							className="input input-primary text-md input-md w-full max-w-xs bg-base-100 focus:outline-none focus:border-primary/70 focus:border-2"
							placeholder="Add new item for this day.."></input>
					</div>
				</div>
				{/* Add more sidebar items as needed */}
			</div>
		</div>
	)
}

export default RightSection;