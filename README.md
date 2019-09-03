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



