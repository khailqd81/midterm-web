package com.web.midterm;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.Contact;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableWebMvc
@EnableSwagger2
public class MidtermApplication {

	public static void main(String[] args) {
		SpringApplication.run(MidtermApplication.class, args);
	}
	 
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
//	@Bean
//    public InternalResourceViewResolver defaultViewResolver() {
//        return new InternalResourceViewResolver();
//    }
	
    @Bean
    public Docket api() {
//    	return new Docket(DocumentationType.SWAGGER_2)  
//    	          .select()                                  
//    	          .apis(RequestHandlerSelectors.any())              
//    	          .paths(PathSelectors.any())                          
//    	          .build(); 
//    	List<RequestParameter> globalRequestParameters = new ArrayList<>();
//        RequestParameterBuilder customHeaders = new RequestParameterBuilder();
//        customHeaders.name("Authorization").in(ParameterType.HEADER)
//            .required(true)
//            .build();
//        globalRequestParameters.add(customHeaders.build());
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfoMetaData())
                .securityContexts(Arrays.asList(securityContext()))
                .securitySchemes(Arrays.asList(apiKey()))
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfoMetaData() {

        return new ApiInfoBuilder().title("API FOR PRESENTATION WEB APP")
                .description("API Endpoint Decoration")
                .contact(new Contact("Phạm Tiến Khải", "https://www.dev-team.com/", "khailqd81@gmail.com"))
                .license("Apache 2.0")
                .licenseUrl("http://www.apache.org/licenses/LICENSE-2.0.html")
                .version("1.0.0")
                .build();
    }
    
    private ApiKey apiKey() {
        return new ApiKey("JWT", "Authorization", "header");
    }
    
    private SecurityContext securityContext() { 
        return SecurityContext.builder().securityReferences(defaultAuth()).build(); 
    } 

    private List<SecurityReference> defaultAuth() { 
        AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything"); 
        AuthorizationScope[] authorizationScopes = new AuthorizationScope[1]; 
        authorizationScopes[0] = authorizationScope; 
        return Arrays.asList(new SecurityReference("JWT", authorizationScopes)); 
    }
}
