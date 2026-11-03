***import argparse
import os
import time

import serial
import serial.tools.list_ports
from dotenv import load_dotenv
from supabase import create_client


def find_arduino_port() -> str:
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        raise RuntimeError("Arduino 시리얼 포트를 찾을 수 없습니다.")

    for port in ports:
        description = f"{port.description} {port.manufacturer or ''}".lower()
        if any(name in description for name in ("arduino", "usb serial", "ch340", "cp210", "ftdi", "wchusbserial")):
            return port.device

    if len(ports) == 1:
        return ports[0].device

    raise RuntimeError("Arduino 포트를 자동으로 찾지 못했습니다. --port 옵션으로 포트를 지정하세요.")


def parse_value(text: str):
    text = text.strip()
    try:
        return int(text)
    except ValueError:
        try:
            return float(text)
        except ValueError:
            return text


def main() -> None:
    load_dotenv()

    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")
    if not url:
        raise RuntimeError(".env에 VITE_SUPABASE_URL이 없습니다.")
    if not key:
        raise RuntimeError(".env에 VITE_SUPABASE_ANON_KEY가 없습니다.")

    parser = argparse.ArgumentParser(description="Arduino 시리얼 데이터를 Supabase로 업로드합니다.")
    parser.add_argument("--port", help="예: /dev/cu.usbmodem2101 또는 COM3")
    args = parser.parse_args()

    port_name = args.port or find_arduino_port()
    supabase = create_client(url, key)

    print(f"{port_name}에 연결 중 (9600 baud)...", flush=True)
    with serial.Serial(port_name, 9600, timeout=1) as arduino:
        time.sleep(2)
        print("데이터 수신 및 업로드 시작", flush=True)

        while True:
            raw_line = arduino.readline()
            if not raw_line:
                continue

            value_text = raw_line.decode("utf-8", errors="replace").strip()
            if not value_text:
                continue

            print(f"수신: {value_text}", flush=True)
            try:
                supabase.table("readings").insert({"value": parse_value(value_text)}).execute()
                print(f"업로드 완료: {value_text}", flush=True)
            except Exception as error:
                print(f"업로드 실패 ({value_text}): {error}", flush=True)


if __name__ == "__main__":
    main()
