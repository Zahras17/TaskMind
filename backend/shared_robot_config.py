# shared_robot_config.py

import URBasic
import robotiq_gripper

host = "192.168.1.2"
acc = 0.4
vel = 0.5

# 👇 Initialize and activate gripper once
# _gripper = robotiq_gripper.RobotiqGripper()
# _gripper.connect(host, 63352)
# _gripper.activate()

def get_robot():
    robotModel = URBasic.robotModel.RobotModel()
    robot = URBasic.urScriptExt.UrScriptExt(host=host, robotModel=robotModel)

    robot.reset_error()
    return robot

def get_gripper():
    gripper = robotiq_gripper.RobotiqGripper()
    gripper.connect(host, 63352)
    gripper.activate()
    return gripper
