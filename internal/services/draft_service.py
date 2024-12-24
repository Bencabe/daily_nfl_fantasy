from models.draft_models import DraftMessages, TurnChange

class DraftService:
    def __init__(self):
        pass

    def hanlde_message(raw_message: dict[str, any], player_order) -> DraftMessage:
        message = DraftMessage.model_validate(raw_message)
        if isinstance(message, TurnChange):
            next_player = player_order[player_order.index(message.previous_player_id) + 1]
            message.next_player_id = player_order[player_order.index(message.previous_player_id) + 1]
            return {

            }
