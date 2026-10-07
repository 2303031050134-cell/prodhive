package com.prodhive_core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
public class Application {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		loadDotEnv();
		SpringApplication.run(Application.class, args);
	}

	private static void loadDotEnv() {
		java.nio.file.Path[] paths = new java.nio.file.Path[] {
			java.nio.file.Paths.get(".env"),
			java.nio.file.Paths.get("../.env"),
			java.nio.file.Paths.get("c:/Users/User/OneDrive/Desktop/NewProdhive/.env")
		};
		for (java.nio.file.Path path : paths) {
			if (java.nio.file.Files.exists(path)) {
				try {
					java.util.List<String> lines = java.nio.file.Files.readAllLines(path);
					StringBuilder multilineVal = null;
					String multilineKey = null;

					for (String line : lines) {
						String trimmed = line.trim();
						if (multilineKey != null) {
							if (trimmed.endsWith("\"")) {
								multilineVal.append("\n").append(trimmed, 0, trimmed.length() - 1);
								if (System.getProperty(multilineKey) == null) {
									System.setProperty(multilineKey, multilineVal.toString());
								}
								multilineKey = null;
								multilineVal = null;
							} else {
								multilineVal.append("\n").append(line);
							}
							continue;
						}
						if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
						int eq = line.indexOf('=');
						if (eq > 0) {
							String key = line.substring(0, eq).trim();
							String val = line.substring(eq + 1).trim();
							if (val.startsWith("\"") && !val.endsWith("\"")) {
								multilineKey = key;
								multilineVal = new StringBuilder(val.substring(1));
							} else {
								if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
									val = val.substring(1, val.length() - 1);
								}
								if (System.getProperty(key) == null) {
									System.setProperty(key, val);
								}
							}
						}
					}
					break;
				} catch (Exception ignored) {}
			}
		}
	}

}


