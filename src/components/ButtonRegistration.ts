// Thanks to @partywumpus on discord

export const enum PhysicalButton {
    R2 = 0,
    L2 = 1,
    R1 = 2,
    L1 = 3,
    Y = 4,
    B = 5,
    X = 6,
    A = 7,
    DPAD_UP = 8,
    DPAD_RIGHT = 9,
    DPAD_LEFT = 10,
    DPAD_DOWN = 11,
    SELECT = 12,
    STEAM = 13,
    START = 14,
    L5 = 15,
    R5 = 16,
    LEFT_TOUCHPAD_CLICK = 17,
    RIGHT_TOUCHPAD_CLICK = 18,
    LEFT_TOUCHPAD_TOUCH = 19,
    RIGHT_TOUCHPAD_TOUCH = 20,
    L3 = 22,
    R3 = 26,
    MUTE_DUALSENSE = 29,

    L4 = 9+32,
    R4 = 10+32,
    LEFT_JOYSTICK_TOUCH=14+32,
    RIGHT_JOYSTICK_TOUCH=15+32,
    QUICK_ACCESS_MENU=18+32,
}

export function registerForInputEvent(callback: (buttons: Button[], rawEvent: ControllerStateChange[]) => void): Unregisterable {
    return SteamClient.Input.RegisterForControllerStateChanges(async (changes: ControllerStateChange[]) => {
        const buttons: Button[] = [];
        for (const change of changes) {
            const lower_buttons = change.ulButtons.toString(2).padStart(32, "0").split('');
            for (const [index, value] of lower_buttons.entries()) {
                if (value === '1') {
                    buttons.push(31-index as Button)
                }
            }
            const upper_buttons = change.ulUpperButtons.toString(2).padStart(32, "0").split('');
            for (const [index, value] of upper_buttons.entries()) {
                if (value === '1') {
                    buttons.push(63-index as Button)
                }
            }
        }
        callback(buttons, changes);
    });
}