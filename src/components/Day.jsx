import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import CheckIcon from "./icons/check";

//import { DayPicker } from "react-day-picker";

export default function Day() {
  const [greetMsg, setGreetMsg] = useState("");
  let todayDate = new Date();
  const [date, setDate] = useState(todayDate);
  const [tasks, setTasks] = useState([]);

 useEffect(() => {
  async function fetchDayItems() {
    try {
      const dayItems = await invoke("fetch_day_items", { date });
      //console.log("Fetched day items:", dayItems);
      setTasks(dayItems);
    } catch (error) {
      console.error("Failed to fetch day items:", error);
    }
  }

  fetchDayItems();
}, []); // ← This empty array is CRITICAL


  return (
    <div className="card w-48 bg-base-100 shadow-sm">
      <div className="card-body">
        {/* <span className="badge badge-xs badge-warning">Most Popular</span> */}
        <div className="flex justify-between">
          <h2 className="text-xl">Sunday</h2>
          <h2 className="text-xl font-bold">29</h2>
          {/* <span className="text-xl">29</span> */}
        </div>
        <div class="overflow-y-auto max-h-48 no-scrollbar">
        <ul className="mt-2 flex flex-col gap-1 text-xxs">
          {tasks.map((task)=> (
            <li>
              <CheckIcon />
              <span>{task.item}</span>
            </li>
          ))}
        </ul>
        </div>
        {/* <div className="mt-6">
          <button className="btn btn-primary btn-block">Subscribe</button>
        </div> */}
      </div>
    </div>
  );
}
