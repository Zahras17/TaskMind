how to run the code: in a terminal go to the repository of the backend: 
PS C:\Zahra\PhD topic\Python\React\react-fastapi-robot\backend
activate  the environment: .\venv\Scripts\activate
then run: uvicorn main:app --reload
in the browser you can check it: http://127.0.0.1:8000/
for each task: http://127.0.0.1:8000/robot/execute/task_1


then in another terminal go to frontend: 
PS C:\Zahra\PhD topic\Python\React\react-fastapi-robot\frontend-ur-robot
start the front end: 
npm start

it will run in a new browser: http://localhost:3000/

# Robot
- in Main.py change if you are connected to the real robot.
- in order for the robot to work, you need to fisrt move it to waypoint 1 via teach pendant. 
if it's located or stopped somewhere else it would not start.
- you need to activate gripper as well
- you need to set it to remote control

# log
- in the log file, for next buttons--> save the taskId of current step that next is pressed
- Previous button--> also shows the current task that previous is clicked




### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm start