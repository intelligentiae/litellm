#### Analytics Endpoints #####
import os
import re
from typing import Final

from fastapi import APIRouter

from litellm.proxy.common_utils.claude_code_marketplace_auth import marketplace_auth_required
from litellm.proxy.common_utils.html_forms.default_credentials_hint import should_hide_default_credentials_hint
from litellm.proxy.mcp_server.stdio_gate import is_mcp_stdio_enabled
from litellm.types.proxy.discovery_endpoints.ui_discovery_endpoints import (
    UiDiscoveryEndpoints,
)

router: Final = APIRouter()

_BUILTIN_DEFAULT_LANGUAGE: Final = "en"
_BUILTIN_LANGUAGE_STORAGE_KEY: Final = "litellm_language"
_LANGUAGE_CODE: Final = re.compile(r"^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$")
_STORAGE_KEY: Final = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


def ui_language_settings() -> tuple[str, str]:
    raw_language: Final = os.getenv("DEFAULT_LANGUAGE", _BUILTIN_DEFAULT_LANGUAGE)
    raw_storage_key: Final = os.getenv("LANGUAGE_STORAGE_KEY", _BUILTIN_LANGUAGE_STORAGE_KEY)
    language: Final = raw_language.strip().lower()
    storage_key: Final = raw_storage_key.strip()
    return (
        language if _LANGUAGE_CODE.fullmatch(language) else _BUILTIN_DEFAULT_LANGUAGE,
        storage_key if _STORAGE_KEY.fullmatch(storage_key) else _BUILTIN_LANGUAGE_STORAGE_KEY,
    )


@router.get("/.well-known/litellm-ui-config", response_model=UiDiscoveryEndpoints)
@router.get("/litellm/.well-known/litellm-ui-config", response_model=UiDiscoveryEndpoints)  # if mounted at root path
async def get_ui_config():
    from litellm.proxy.auth.auth_utils import has_user_setup_sso
    from litellm.proxy.proxy_server import general_settings
    from litellm.proxy.utils import get_proxy_base_url, get_server_root_path

    auto_redirect_ui_login_to_sso: Final = (
        os.getenv("AUTO_REDIRECT_UI_LOGIN_TO_SSO", "false").lower() == "true"
        or general_settings.get("auto_redirect_ui_login_to_sso", False) is True
    )
    admin_ui_disabled: Final = os.getenv("DISABLE_ADMIN_UI", "false").lower() == "true"
    use_si_terminology: Final = os.getenv("LITELLM_UI_USE_SI_TERMINOLOGY", "false").lower() == "true"
    hide_default_credentials_hint: Final = should_hide_default_credentials_hint(general_settings)

    sso_configured: Final = has_user_setup_sso()

    from litellm.proxy.proxy_server import proxy_config

    is_control_plane: Final = len(proxy_config.worker_registry) > 0

    raw_gateway_base_url: Final[str | None] = os.getenv("LITELLM_GATEWAY_URL")
    gateway_base_url: Final[str | None] = (
        raw_gateway_base_url.strip().rstrip("/") or None if raw_gateway_base_url is not None else None
    )
    default_language, language_storage_key = ui_language_settings()

    return UiDiscoveryEndpoints(
        server_root_path=get_server_root_path(),
        proxy_base_url=get_proxy_base_url(),
        gateway_base_url=gateway_base_url,
        auto_redirect_to_sso=sso_configured and auto_redirect_ui_login_to_sso,
        admin_ui_disabled=admin_ui_disabled,
        sso_configured=sso_configured,
        hide_default_credentials_hint=hide_default_credentials_hint,
        is_control_plane=is_control_plane,
        workers=proxy_config.worker_registry if is_control_plane else [],
        mcp_stdio_enabled=is_mcp_stdio_enabled(),
        use_si_terminology=use_si_terminology,
        claude_code_marketplace_auth_required=marketplace_auth_required(),
        default_language=default_language,
        language_storage_key=language_storage_key,
    )
