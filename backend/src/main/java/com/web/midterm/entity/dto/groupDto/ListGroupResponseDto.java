package com.web.midterm.entity.dto.groupDto;

import java.util.ArrayList;
import java.util.List;

import com.web.midterm.entity.Group;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ListGroupResponseDto {
	List<Group> owner = new ArrayList<>();
	List<Group> member = new ArrayList<>();
	List<Group> coowner = new ArrayList<>();
}
