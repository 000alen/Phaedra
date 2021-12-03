from Phaedra.Language import Mode, set_mode
from Phaedra.Secrets import get_secrets, set_secrets
from Phaedra.API import run

set_secrets(get_secrets())
set_mode(Mode.REMOTE)

run()
