# WAVES
## Logging Events
Each log is sent with a number of fields required by [simplelog](https://github.com/fielddaylab/simplelog). Simple log allows for a custom field called event_data_complex along with its category enumerator:
  event_custom: category enumerator
  event_data_complex: JSON.stringify(log_data)
Each log_data is a JSON object for that specific category as defined below.
Note: Note: event_custom will always map to a string of the event name. For example, if an event called FOO had a field of "event_custom", its value would be a string "FOO". Not all events have this field.

#### Change Log
Versions:
1. Original Version
2. Logging Menu Button clicks, skip clicks, and menu dismiss (close menu). (7/25/2019)
3. Bug fixes. Three main changes: (1) Default global_lvl_complete to false so that new games don't cause a level fail.
(2) Does not log level 0 success/fail, because that is just the default cur_level value (and its a playground)
(3) Does not log playground success/fail (lvls 0,10,18) (9/17/2019)
4. Simple log now sends player_id (if present) from the URL to log.php (9/24/2019)

## Game Information:
- There are 3 types of levels: Playground, Challenge, Random. 
- The games starts with wave playground (level 0).
- Playground does not have a correct answer (its for exploration only)
- Challenges and playgrounds need to be played to unlock subsequent levels.
- After completing each challenge, a random level will be unlocked, that can be played an unlimited amount of times, constantly giving a random scenario within the scope of the previous challenge.
- There are 4 questions: 2 after challenge 1 and 2 after challenge 2.
- There are 34 Levels

| Menu Options | Included Level Range | Succeeding Questions |
| --- | --- | --- | 
| Playground - Wave | Lv 0| |
| Challenges - 1| Lv 1 - 8 |Q0, Q1 |
| Random - 1 |Lv 9 | |
| Playground - Pulse| Lv 10 | |
| Challenges - 2|Lv 11-16 |Q2, Q3 |
| Random - 2| Lv 17| |
| Playground - Composition | Lv 18 | |
| Challenges - 3 | | |
| Random -3 | | |
| Challenges - 4 | | |
| Random - 4 | | |
| Challenges - 5 | | |
| Random - 5 | Lv 34 | |


### Event Categories
- [COMPLETE](#COMPLETE)
- [SUCCEED](#SUCCEED)
- [FAIL](#FAIL)
- [RESET_BTN_PRESS](#RESET_BTN_PRESS)
- [SLIDER_MOVE_RELEASE](#SLIDER_MOVE_RELEASE)
- [ARROW_MOVE_RELEASE](#ARROW_MOVE_RELEASE)
- [QUESTION_ANSWER](#QUESTION_ANSWER)
- [MENU_BUTTON](#MENU_BUTTON)
- [SKIP_BUTTON](#SKIP_BUTTON)
- [DISMISS_MENU_BUTTON](#DISMISS_MENU_BUTTON)

<a name="COMPLETE"/>

#### COMPLETE
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|amplitude_left |float | |
|wavelength_left |float | |
|offset_left |float | |
|amplitude_right |float | |
|wavelength_right |float | |
|offset_right |float | |
|closeness |float | |




<a name="SUCCEED"/>

#### SUCCEED
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|amplitude_left |float | |
|wavelength_left |float | |
|offset_left |float | |
|amplitude_right |float | |
|wavelength_right |float | |
|offset_right |float | |
|closeness |float | |




<a name="FAIL"/>

#### FAIL
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|amplitude_left |float | |
|wavelength_left |float | |
|offset_left |float | |
|amplitude_right |float | |
|wavelength_right |float | |
|offset_right |float | |
|closeness |float | |




<a name="RESET_BTN_PRESS"/>

#### RESET_BTN_PRESS
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|amplitude_left |float | |
|wavelength_left |float | |
|offset_left |float | |
|amplitude_right |float | |
|wavelength_right |float | |
|offset_right |float | |
|closeness |float | |




<a name="SLIDER_MOVE_RELEASE"/>

#### SLIDER_MOVE_RELEASE
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|slider |{'enum': ['AMPLITUDE', 'OFFSET', 'WAVELENGTH']} | |
|wave |string | |
|begin_val |float | |
|end_val |float | |
|min_val |float | |
|max_val |float | |
|ave_val |float | |
|begin_closeness |float | |
|end_closeness |float | |
|drag_length_ticks |int | |
|direction_shifts |int | |
|stdev_val |float | |
|correct_val |float | |




<a name="ARROW_MOVE_RELEASE"/>

#### ARROW_MOVE_RELEASE
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|slider |string | |
|wave |string | |
|begin_val |float | |
|end_val |float | |
|closeness |float | |
|correct_val |float | |




<a name="QUESTION_ANSWER"/>

#### QUESTION_ANSWER
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |
|answer |int | |
|answered |int | |
|question |int | |




<a name="MENU_BUTTON"/>

#### MENU_BUTTON
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |string | |




<a name="SKIP_BUTTON"/>

#### SKIP_BUTTON
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |SKIP_BUTTON | |




<a name="DISMISS_MENU_BUTTON"/>

#### DISMISS_MENU_BUTTON
| event Name | Description | Note |
| --- | --- | --- |
|event_custom |DISMISS_MENU_BUTTON | |



